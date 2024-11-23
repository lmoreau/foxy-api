import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHandler } from "../../shared/cors";
import { dataverseUrl, getDataverseHeaders } from "../../shared/dataverseAuth";
import axios from "axios";

const JIRA_DOMAIN = "infusionit.atlassian.net";
const JIRA_EMAIL = "sxkgghgcgs@privaterelay.appleid.com";
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const PROJECT_KEY = "FB";

interface BugReport {
    title: string;
    description: string;
    url: string;
    userAgent: string;
    timestamp: string;
}

async function getCurrentUser(authHeader: string, context: InvocationContext): Promise<string> {
    try {
        context.log('Getting current user from Dataverse');
        const headers = getDataverseHeaders(authHeader);

        // First get the current user's ID using WhoAmI
        const whoAmIUrl = `${dataverseUrl}/api/data/v9.2/WhoAmI`;
        context.log('Calling WhoAmI:', whoAmIUrl);
        const whoAmIResponse = await axios.get(whoAmIUrl, { headers });
        context.log('WhoAmI Response:', whoAmIResponse.data);

        if (!whoAmIResponse.data.UserId) {
            throw new Error('No user ID found in WhoAmI response');
        }

        // Then get the user's details using their ID
        const userId = whoAmIResponse.data.UserId;
        const userUrl = `${dataverseUrl}/api/data/v9.2/systemusers(${userId})?$select=fullname`;
        context.log('Getting user details:', userUrl);
        
        const userResponse = await axios.get(userUrl, { headers });
        context.log('User Response:', userResponse.data);
        
        return userResponse.data.fullname || 'Unknown User';
    } catch (error) {
        context.log('Error getting current user:', error);
        if (axios.isAxiosError(error)) {
            context.log('Axios Error Response:', error.response?.data);
            context.log('Axios Error Status:', error.response?.status);
        }
        return 'Unknown User';
    }
}

async function getIssueTypeId(context: InvocationContext): Promise<string> {
    if (!JIRA_API_TOKEN) {
        throw new Error('JIRA_API_TOKEN environment variable is not set');
    }

    try {
        const response = await axios({
            method: 'GET',
            url: `https://${JIRA_DOMAIN}/rest/api/3/issue/createmeta?projectKeys=${PROJECT_KEY}&expand=projects.issuetypes`,
            auth: {
                username: JIRA_EMAIL,
                password: JIRA_API_TOKEN
            },
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const project = response.data.projects[0];
        if (!project) {
            throw new Error(`Project ${PROJECT_KEY} not found`);
        }

        const taskIssueType = project.issuetypes.find(type => type.id === '10016');
        if (!taskIssueType) {
            throw new Error('Task issue type (10007) not found for this project');
        }
        
        return taskIssueType.id;
    } catch (error) {
        context.log('Error fetching issue types:', error);
        throw error;
    }
}

async function createJiraIssueHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('=== Starting createJiraIssueHandler ===');
    context.log('Request Headers:', Object.fromEntries(request.headers.entries()));
    
    if (!JIRA_API_TOKEN) {
        context.log('JIRA_API_TOKEN environment variable is not set');
        return {
            status: 500,
            jsonBody: { error: "Jira API token not configured" }
        };
    }
    
    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        context.log('No authorization header found');
        return {
            status: 401,
            jsonBody: { error: "Authorization header is required" }
        };
    }

    try {
        const bugReport = await request.json() as BugReport;
        context.log('Bug Report:', bugReport);
        
        if (!bugReport || !bugReport.title || !bugReport.description) {
            context.log('Invalid bug report data');
            return {
                status: 400,
                jsonBody: { error: "Please provide title and description for the bug report" }
            };
        }

        // Get user's name from Dataverse
        const userName = await getCurrentUser(authHeader, context);
        context.log('Got user name:', userName);

        const issueTypeId = await getIssueTypeId(context);
        
        const response = await axios({
            method: 'POST',
            url: `https://${JIRA_DOMAIN}/rest/api/3/issue`,
            auth: {
                username: JIRA_EMAIL,
                password: JIRA_API_TOKEN
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: {
                fields: {
                    project: {
                        key: PROJECT_KEY
                    },
                    issuetype: {
                        id: issueTypeId
                    },
                    summary: bugReport.title,
                    description: {
                        version: 1,
                        type: "doc",
                        content: [
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        text: bugReport.description,
                                        type: "text"
                                    }
                                ]
                            },
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        text: "\n\nAdditional Context:",
                                        type: "text",
                                        marks: [{ type: "strong" }]
                                    }
                                ]
                            },
                            {
                                type: "bulletList",
                                content: [
                                    {
                                        type: "listItem",
                                        content: [
                                            {
                                                type: "paragraph",
                                                content: [
                                                    {
                                                        text: `Reported By: ${userName}`,
                                                        type: "text"
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        type: "listItem",
                                        content: [
                                            {
                                                type: "paragraph",
                                                content: [
                                                    {
                                                        text: `Page URL: ${bugReport.url}`,
                                                        type: "text"
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        type: "listItem",
                                        content: [
                                            {
                                                type: "paragraph",
                                                content: [
                                                    {
                                                        text: `Browser Info: ${bugReport.userAgent}`,
                                                        type: "text"
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        type: "listItem",
                                        content: [
                                            {
                                                type: "paragraph",
                                                content: [
                                                    {
                                                        text: `Reported At: ${bugReport.timestamp}`,
                                                        type: "text"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        });

        context.log('Jira API response:', response.data);
        return {
            status: 201,
            jsonBody: {
                message: "Bug report created successfully",
                issueKey: response.data.key,
                issueUrl: `https://${JIRA_DOMAIN}/browse/${response.data.key}`
            }
        };

    } catch (error) {
        context.log('=== Error in createJiraIssueHandler ===');
        if (axios.isAxiosError(error)) {
            context.log('Axios Error Response:', error.response?.data);
            context.log('Axios Error Status:', error.response?.status);
            context.log('Axios Error Headers:', error.response?.headers);
        }
        context.log('Full Error:', error);
        
        if (axios.isAxiosError(error) && error.response) {
            return {
                status: error.response.status,
                jsonBody: { error: 'Failed to create Jira issue', details: error.response.data }
            };
        }
        return {
            status: 500,
            jsonBody: { error: 'Failed to create Jira issue' }
        };
    }
}

app.http('createJiraIssue', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    route: 'createJiraIssue',
    handler: createJiraIssueHandler
});
