import { askAgent } from "../src/ai";

async function main() {
 console.log("Calling askAgent helper...");
 try {
 const answer = await askAgent(
 "What financial support is available for parents of preterm twins?",
 "parent"
 );

 console.log("\nResponse:\n");
 console.log(answer);
 } catch (error) {
 console.error("Error asking agent:", error);
 }
}

main();
