// pages/api/coingecko.js
export default async function handler(req, res) {
  const { coinId } = req.query;
  if (!coinId) {
    res.status(400).json({ error: "Coin ID is required" });
    return;
  }

  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}`
  );
  const data = await response.json();
  res.status(200).json(data);
}
