import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createClient } from "@supabase/supabase-js";

let vectorStoreInstance: SupabaseVectorStore | null = null;

export function getVectorStore(): SupabaseVectorStore {
  if (!vectorStoreInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    vectorStoreInstance = new SupabaseVectorStore(new GoogleGenerativeAIEmbeddings({ model: "gemini-embedding-2" }), {
      client: supabase,
      tableName: "documents",
      queryName: "match_documents",
    });
  }
  return vectorStoreInstance;
}

export async function retrieveRelevantContext(query: string, k = 6): Promise<string> {
  try {
    const store = getVectorStore();
    const docs = await store.similaritySearch(query, k);
    return docs.map((doc) => doc.pageContent).join("\n\n---\n\n");
  } catch (error) {
    console.warn("RAG retrieval failed (possibly due to missing API keys/DB connection):", error);
    return "No relevant context found.";
  }
}
