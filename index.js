/**************************************************************************
 MantisHub GitHub Actions
 Copyright (c) MantisHub - Victor Boctor
 All rights reserved.
 **************************************************************************/

const https = require('https');

/**
 * Env variables from GitHub workflow input
 */
const params = {
    url: process.env['INPUT_URL'] || "",
    apiKey: process.env['INPUT_API-KEY'] || "",
    project: process.env['INPUT_PROJECT'] || "",
    summary: process.env['INPUT_SUMMARY'] || "",
    description: process.env['INPUT_DESCRIPTION'] || "",
    category: process.env['INPUT_CATEGORY'] || ""
};

/**
 * Main function
 */
async function run() {
    if (!params.url || !params.apiKey || !params.project) {
        throw new Error("Project name, url and api-key inputs are required.");
    }

    const newIssue = await createNewIssue(params);
    console.log(`::set-output name=issue-id::${newIssue.issue.id}`);
    return newIssue.issue.id;
}

/**
 * Create an issue in MantisHub
 *
 * @param data
 */
async function createNewIssue(data) {
    try {
        // validate request body for create issue
        const validatedData = validateInput(data);
        // Create a new issue
        return await createIssue(validatedData);
    } catch (error) {
        console.error("Failed to create issue:", error.message);
        if (error.response) {
            console.error("Error response data:", error.response.data);
        }
        process.exit(1);
    }
}

/**
 * HTTP Requests
 *
 * @param url
 * @param method 'GET', 'PATCH', 'POST'
 * @param body
 */
async function httpRequest(url, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        let options = {
            method: method,
            headers: {
                'Authorization': params.apiKey,
                'Content-Type': 'application/json',
            }
        }
        if (body !== null) {
            options.body = JSON.stringify(body)
        }
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data); // Resolve with the response data
                } else {
                    console.log(`Request failed with status code ${res.statusCode}: ${data}`)
                    reject(new Error(`Request failed with status code ${res.statusCode}: ${data}`));

                }
            });
        });
        if (body !== null) {
            req.write(JSON.stringify(body));
        }
        req.on('error', (e) => {
            reject(e); // Reject the promise with the error
        });
        req.end(); // End the request
    });
}

/**
 * Creates a new issue
 * @param body
 */
async function createIssue(body) {
    const endpoint = `${params.url}/api/rest/issues`;
    console.log('Making POST request to create new issue :' + endpoint)
    const response = await httpRequest(endpoint, 'POST', body);
    const responseBody = JSON.parse(response);
    console.log(responseBody);
    return responseBody;
}

/**
 * ===== Utility functions =======
 */
function validateInput(params) {
    const result = {};
    // Validate and set the 'name' parameter (required and must be a string)
    if (typeof params.summary === 'string' && params.summary.trim() !== '') {
        result.summary = params.summary.trim();
    } else {
        console.error("The 'summary' parameter is required and must be a non-empty string.")
        process.exit(1)
    }

    // Validate and set the 'description'
    if (typeof params.description === 'string' && params.description.trim() !== '') {
        result.description = params.description.trim();
    } else {
        console.error("The 'summary' parameter is required and must be a non-empty string.")
        process.exit(1)
    }
    // Validate and set the 'category' parameter
    if (typeof params.category === 'string' && params.category.trim() !== '') {
        result.category = {name: ''};
        result.category.name = params.category.trim()
    } else {
        console.error("The 'category' parameter is required and must be a non-empty string.")
        process.exit(1)
    }
    // Validate and set the 'project' parameter
    if (typeof params.project === 'string' && params.project.trim() !== '') {
        result.project = {name: ''};
        result.project.name = params.project.trim();
    } else {
        console.error("The 'project' parameter is required and must be a non-empty string.")
        process.exit(1)
    }
    return result;
}

run();
