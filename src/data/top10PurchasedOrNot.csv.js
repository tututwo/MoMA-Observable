import * as d3 from "d3";
// https://media.githubusercontent.com/media/MuseumofModernArt/collection/refs/heads/main/Artworks.csv
export default async function artsworksPurchased(url) {
  const response = await d3.csv(url);
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
  const top10ArtistFullData = response.filter((fullDataItem) =>
    top10ArtistNames.includes(fullDataItem.Artist)
  );

  top10ArtistFullData.forEach((top10Each) => {
    const creditLine = top10Each.CreditLine.toLowerCase(); // Convert to lowercase for case-insensitive matching

    const containsPurchase = /purchase/.test(creditLine); // Check if it contains "purchase"
    const containsFund = /fund/.test(creditLine); // Check if it contains "fund"
    const containsProgram = /program/.test(creditLine); // Check if it contains "program"

    // Include if it contains "purchase" but NOT both "purchase" and "fund" OR "purchase" and "program"
    if (containsPurchase && !(containsFund || containsProgram)) {
      top10Each.PurchasedOrNot = true;
    } else {
      top10Each.PurchasedOrNot = false;
    }
  });

  const groupedData0 = d3.flatGroup(
    top10ArtistFullData,
    (d) => d.Artist,
    (d) => d.PurchasedOrNot
  );

  // Step 1: Group by artist using d3.group
  const groupedData = d3.group(groupedData0, (d) => d[0]);

  // Step 2: Compute the percentage for each entry
  const resultArray = [];
  groupedData.forEach((entries, artist) => {
    // Calculate the total length for the artist
    const totalLength = entries.reduce(
      (acc, entry) => acc + entry[2].length,
      0
    );

    // Calculate and add percentage for each entry
    entries.forEach((entry) => {
      const length = entry[2].length;
      const percentage = (length / totalLength) * 100;
      resultArray.push([...entry, percentage]); // Add the percentage as a new column
    });
  });

  const result = resultArray.map(
    ([artist, PurchasedOrNot, items, percentages]) => ({
      Artist: artist,
      PurchasedOrNot: PurchasedOrNot,
      percentage: percentages
    })
  );

  return result
}
process.stdout.write(
  d3.csvFormat(
    await artsworksPurchased(
      "https://media.githubusercontent.com/media/MuseumofModernArt/collection/refs/heads/main/Artworks.csv"
    )
  )
);
