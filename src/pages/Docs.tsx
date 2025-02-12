
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ApiDocs = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">API Documentation</h1>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="responses">Response Types</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>
                The Crypto Fundraising API provides access to cryptocurrency fundraising data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Base URL: <code className="bg-gray-100 p-1 rounded">/functions/v1/fundraising-api</code></p>
              <p>All endpoints support CORS and return JSON responses.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>GET /all</CardTitle>
                <CardDescription>Retrieve all fundraising data</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded">
                  {`GET /all
Response: Array<FundraisingData>`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GET /download</CardTitle>
                <CardDescription>Download complete dataset as JSON</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded">
                  {`GET /download
Response: JSON file download`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GET /search</CardTitle>
                <CardDescription>Search fundraising data with filters</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded">
                  {`GET /search?token=BTC&investor=a16z&round=seed
Parameters:
- token: Filter by token
- investor: Filter by investor
- round: Filter by round type`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GET /recent</CardTitle>
                <CardDescription>Get recent fundraising events</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded">
                  {`GET /recent?limit=10
Parameters:
- limit: Number of results (default: 10)`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GET /stats</CardTitle>
                <CardDescription>Get aggregated statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded">
                  {`GET /stats
Response: {
  total_raises: number,
  total_amount: number,
  by_round: Record<string, number>
}`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="examples">
          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">JavaScript/TypeScript</h3>
                  <pre className="bg-gray-100 p-4 rounded">
                    {`// Fetch all fundraising data
const response = await fetch(
  'https://zryhlwfkovkxtqiwzhai.functions.supabase.co/fundraising-api/all'
);
const data = await response.json();

// Search with filters
const searchResponse = await fetch(
  'https://zryhlwfkovkxtqiwzhai.functions.supabase.co/fundraising-api/search?token=ETH&round=seed'
);
const searchResults = await searchResponse.json();

// Download data
window.location.href = 
  'https://zryhlwfkovkxtqiwzhai.functions.supabase.co/fundraising-api/download';`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Python</h3>
                  <pre className="bg-gray-100 p-4 rounded">
                    {`import requests

# Fetch recent fundraises
response = requests.get(
    'https://zryhlwfkovkxtqiwzhai.functions.supabase.co/fundraising-api/recent',
    params={'limit': 5}
)
data = response.json()

# Get statistics
stats = requests.get(
    'https://zryhlwfkovkxtqiwzhai.functions.supabase.co/fundraising-api/stats'
).json()`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses">
          <Card>
            <CardHeader>
              <CardTitle>Response Types</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded">
                {`// Fundraising Data Type
interface FundraisingData {
  id: string;
  original_submission_id: string;
  name: string;
  description: string;
  amount_raised: number | null;
  investors: string[];
  token: string | null;
  lead_investor: string | null;
  round_type: string | null;
  twitter_url: string | null;
  announcement_username: string | null;
  tweet_timestamp: string | null;
  processed_at: string;
}

// Stats Response Type
interface StatsResponse {
  total_raises: number;
  total_amount: number;
  by_round: {
    [roundType: string]: number;
  };
}

// Error Response Type
interface ErrorResponse {
  error: string;
}`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiDocs;
