import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createClient } from "@supabase/supabase-js";

let vectorStoreInstance: SupabaseVectorStore | null = null;

export interface RetrievedKnowledgeDocument {
  content: string;
  source: string;
}

function hasVectorStoreConfig(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getVectorStore(): SupabaseVectorStore {
  if (!vectorStoreInstance) {
    if (!hasVectorStoreConfig()) {
      throw new Error("Missing vector store configuration.");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    vectorStoreInstance = new SupabaseVectorStore(
      new GoogleGenerativeAIEmbeddings({ model: "text-embedding-004" }), 
      {
        client: supabase,
        tableName: "document_embeddings",
        queryName: "match_documents",
      }
    );
  }
  return vectorStoreInstance;
}

export async function retrieveRelevantDocuments(
  query: string,
  k = 6
): Promise<RetrievedKnowledgeDocument[]> {
  if (!hasVectorStoreConfig()) {
    return [];
  }

  try {
    const store = getVectorStore();
    const docs = await store.similaritySearch(query, k);
    return docs
      .filter((doc) => typeof doc.pageContent === "string" && doc.pageContent.trim().length > 0)
      .map((doc, index) => ({
        content: doc.pageContent,
        source:
          typeof doc.metadata?.source === "string" && doc.metadata.source.trim().length > 0
            ? doc.metadata.source
            : `vector_document_${index + 1}`,
      }));
  } catch (error) {
    console.warn("RAG retrieval failed (possibly due to missing API keys/DB connection):", error);
    return [];
  }
}

export async function retrieveRelevantContext(query: string, k = 6): Promise<string> {
  const docs = await retrieveRelevantDocuments(query, k);
  if (docs.length === 0) {
    return "No relevant context found.";
  }

  return docs.map((doc) => doc.content).join("\n\n---\n\n");
}
