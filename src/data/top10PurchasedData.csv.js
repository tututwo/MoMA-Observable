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
  purchaseData.forEach(
    (d) => (d.AcquiredYear = new Date(d["DateAcquired"]).getFullYear())
  );
  const top10ArtistNames = [
    "Lee Friedlander",
    "Dorothea Lange",
    "Unidentified photographer",
    "Garry Winogrand",
    "Frans Masereel",
    "Walker Evans",
    "Marcel Duchamp",
    "Harry Callahan",
    "A.R. Penck (Ralf Winkler)",
    "Max Beckmann",
  ];
  const top10Full = purchaseData.filter((fullDataItem) =>
    top10ArtistNames.includes(fullDataItem.Artist)
  );
  const groupedData = d3.flatGroup(
    top10Full,
    (d) => d.Artist,
    (d) => d.AcquiredYear
  );

  // Map the grouped data to get a flat array with counts for each group
  const result = groupedData.map(([artist, AcquiredYear, items]) => ({
    Artist: artist,
    AcquiredYear: AcquiredYear,
    count: items.length
  }));
  return result;
}
process.stdout.write(
  d3.csvFormat(
    await artsworksPurchased(
      "https://media.githubusercontent.com/media/MuseumofModernArt/collection/refs/heads/main/Artworks.csv"
    )
  )
);
