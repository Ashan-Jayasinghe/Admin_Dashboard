import db from "../config/db.js";

// Total number of registered users
export const getTotalUsers = async (req, res) => {
  try {
    const [result] = await db.query("SELECT COUNT(*) AS total FROM users");
    res.json({ totalUsers: result[0].total });
  } catch (error) {
    console.error("Error fetching total users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Total number of all ads
export const getTotalAds = async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT COUNT(*) AS total FROM advertisements"
    );
    res.json({ totalAds: result[0].total });
  } catch (error) {
    console.error("Error fetching total ads:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Total number of fertilizer ads
export const getFertilizerAds = async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT COUNT(*) AS total FROM advertisements WHERE category = 'fertilizer'"
    );
    res.json({ totalFertilizerAds: result[0].total });
  } catch (error) {
    console.error("Error fetching fertilizer ads:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Total number of agrochemical ads
export const getAgrochemicalAds = async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT COUNT(*) AS total FROM advertisements WHERE category = 'agro chemicals'"
    );
    res.json({ totalAgrochemicalAds: result[0].total });
  } catch (error) {
    console.error("Error fetching agrochemical ads:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Total number of machinery ads
export const getMachineryAds = async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT COUNT(*) AS total FROM advertisements WHERE category = 'machinery'"
    );
    res.json({ totalMachineryAds: result[0].total });
  } catch (error) {
    console.error("Error fetching machinery ads:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Total number of planting material ads
export const getPlantingMaterialAds = async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT COUNT(*) AS total FROM advertisements WHERE category = 'planting materials'"
    );
    res.json({ totalPlantingMaterialAds: result[0].total });
  } catch (error) {
    console.error("Error fetching planting material ads:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getGrowthData = async (req, res) => {
  try {
    const [result] = await db.query(`
        SELECT 
          YEAR(created_at) AS year, 
          WEEK(created_at) AS week, 
          COUNT(*) AS count
        FROM users
        GROUP BY YEAR(created_at), WEEK(created_at)
        ORDER BY YEAR(created_at) DESC, WEEK(created_at) DESC
      `);

    // Optionally, you can format the week-year combination into a readable label
    const formattedData = result.map((item) => ({
      label: `${item.year}-W${item.week}`,
      count: item.count,
    }));

    res.json({ growthData: formattedData });
  } catch (error) {
    console.error("Error fetching growth data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Top 5 users who posted the most ads
export const getTopUsers = async (req, res) => {
  try {
    const [result] = await db.query(`
            SELECT u.id, u.name, COUNT(a.id) AS total_ads
            FROM users u
            LEFT JOIN advertisements a ON u.id = a.user_id
            GROUP BY u.id
            ORDER BY total_ads DESC
            LIMIT 5
        `);
    res.json({ topUsers: result });
  } catch (error) {
    console.error("Error fetching top users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Top 5 ads with the highest view counts
export const getTopAds = async (req, res) => {
  try {
    const [result] = await db.query(`
            SELECT id, title, views
            FROM advertisements
            ORDER BY views DESC
            LIMIT 5
        `);
    res.json({ topAds: result });
  } catch (error) {
    console.error("Error fetching top ads:", error);
    res.status(500).json({ message: "Server error" });
  }
};
