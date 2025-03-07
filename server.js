const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/fetch-tasks", async (req, res) => {
    const { jiraUrl, email, apiToken, sprintId } = req.body;

    try {
        const response = await axios.get(`${jiraUrl}/rest/agile/1.0/sprint/${sprintId}/issue?jql=assignee=currentUser()`, {
            headers: { Authorization: `Basic ${Buffer.from(`${email}:${apiToken}`).toString("base64")}` }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/add-comment", async (req, res) => {
    console.log("Received request to add comment:", req.body); // Debug log

    const { jiraUrl, email, apiToken, issueKey, comment } = req.body;

    if (!jiraUrl || !email || !apiToken || !issueKey || !comment) {
        console.error("Missing required fields");
        return res.status(400).json({ error: "Missing required fields" });
    }

    const commentData = {
        body: {
            type: "doc",
            version: 1,
            content: [
                {
                    type: "paragraph",
                    content: [{ type: "text", text: comment }],
                },
            ],
        },
    };

    try {
        console.log("Sending request to Jira API for issue:", issueKey);
        const response = await axios.post(
            `${jiraUrl}/rest/api/3/issue/${issueKey}/comment`,
            commentData,
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${email}:${apiToken}`).toString("base64")}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
            }
        );

        console.log("Comment posted successfully:", response.data);
        res.json({ message: "Comment added successfully", data: response.data });
    } catch (error) {
        console.error("Error posting comment:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || "Internal server error" });
    }
});


app.listen(3000, () => console.log("Server running on port 3000"));