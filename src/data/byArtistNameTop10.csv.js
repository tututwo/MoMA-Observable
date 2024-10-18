import * as d3 from "d3";
// https://media.githubusercontent.com/media/MuseumofModernArt/collection/refs/heads/main/Artworks.csv
export default async function artsworksPurchased(url) {
  const response = await d3.csv(url);

  const purchaseData = response.filter((d) => {
    const creditLine = d.CreditLine.toLowerCase(); // Convert to lowercase for case-insensitive matching

    const containsPurchase = /purchase/.test(creditLine); // Check if it contains "purchase"
    const containsFund = /fund/.test(creditLine); // Check if it contains "fund"
    const containsProgram = /program/.test(creditLine); // Check if it contains "program"

    // Include if it contains "purchase" but NOT both "purchase" and "fund" OR "purchase" and "program"
    return containsPurchase && !(containsFund || containsProgram);
  });
  const groupedData = d3.flatGroup(purchaseData, (d) => d.Artist);

  // Map the grouped data to get a flat array with counts for each group
  const result = groupedData.map(([artist, items]) => ({
    Artist: artist,
    count: items.length
  }));

  return result
    .sort((a, b) => d3.descending(a.count, b.count)) // Sort by 'counted' in descending order
    .slice(0, 10);
}
process.stdout.write(
  d3.csvFormat(
    await artsworksPurchased(
      "https://media.githubusercontent.com/media/MuseumofModernArt/collection/refs/heads/main/Artworks.csv"
    )
  )
);
