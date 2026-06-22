import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const vectorStore = new SupabaseVectorStore(new OpenAIEmbeddings(), {
  client: supabase,
  tableName: "documents",
  queryName: "match_documents",
});

export async function retrieveRelevantContext(query: string, k = 6): Promise<string> {
  const docs = await vectorStore.similaritySearch(query, k);
  return docs.map((doc) => doc.pageContent).join("\n\n---\n\n");
}
