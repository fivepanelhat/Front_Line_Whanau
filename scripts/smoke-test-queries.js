async function runTests() {
 const queries = [
 "What financial support is available for parents of preterm twins in New Zealand?",
 "What are the current guidelines for skin-to-skin contact with preterm babies?",
 "How can I get help from Citizens Advice Bureau for my preterm baby in Taranaki?",
 "Where can whānau find culturally safe preterm support services?",
 "What is the current Best Start payment amount for preterm babies?"
 ];

 for (let i = 0; i < queries.length; i++) {
 console.log(`\n================================`);
 console.log(`Query ${i + 1}: ${queries[i]}`);
 console.log(`================================`);
 
 try {
 const response = await fetch('http://localhost:3000/api/test_agent', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ query: queries[i] })
 });
 
 const data = await response.json();
 if (data.content) {
 console.log(data.content);
 } else {
 console.log(data);
 }
 } catch (err) {
 console.error('Error fetching query:', err);
 }
 }
}

runTests();
