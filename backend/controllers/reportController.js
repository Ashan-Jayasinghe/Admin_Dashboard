import db from "../config/db.js"; // Import your database connection

// New controller method to fetch all reports along with advertisement details
export const getAllReports = async (req, res) => {
  try {
    // Query to fetch all reports along with advertisement details
    const query = `
      SELECT r.*, a.*
      FROM reports r
      LEFT JOIN advertisements a ON r.advertisement_id = a.id
    `;

    // Execute the query and fetch the reports and advertisement details
    const [reports] = await db.query(query);

    // Respond with the fetched reports
    res.status(200).json({
      status: "success",
      data: reports, // Return the reports along with advertisement data
    });

    // Log the reports (for debugging purposes)
    console.log(reports);
  } catch (error) {
    // Catch any errors and log them
    console.error("Error fetching reports:", error);

    // Send an error response
    res.status(500).json({
      status: "error",
      message: "Failed to fetch reports",
      error, // Include the error for debugging
    });
  }
};
