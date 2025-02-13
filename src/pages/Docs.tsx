
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ApiDocs = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Documentation</h1>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="schema">Database Schema</TabsTrigger>
          <TabsTrigger value="pipeline">Data Pipeline</TabsTrigger>
          <TabsTrigger value="examples">Code Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>
                CryptoFundraises collects and processes cryptocurrency fundraising data through multiple sources.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Data Sources</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Twitter announcements and curated submissions</li>
                  <li>Manual CSV imports for historical data</li>
                  <li>Automated data processing pipeline</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Real-time fundraising updates</li>
                  <li>AI-powered data extraction</li>
                  <li>REST API access</li>
                  <li>CSV import/export capabilities</li>
                </ul>
              </div>
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

        <TabsContent value="schema">
          <Card>
            <CardHeader>
              <CardTitle>Database Schema</CardTitle>
              <CardDescription>Core tables and their relationships</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">processed_fundraises</h3>
                <p className="text-sm text-muted-foreground mb-2">Main table storing processed fundraising data</p>
                <pre className="bg-gray-100 p-4 rounded text-sm">
                  {`Table: processed_fundraises
- id: uuid (Primary Key)
- name: text (Project/Company name)
- description: text
- amount_raised: numeric
- investors: text[]
- token: text
- lead_investor: text
- round_type: text
- twitter_url: text
- announcement_username: text
- tweet_timestamp: timestamptz
- processed_at: timestamptz
- slug: text (Unique identifier)
- Tags: text[]
- Website: text
- Date: timestamptz
- Category: text`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">temp_fundraises</h3>
                <p className="text-sm text-muted-foreground mb-2">Temporary table for CSV imports and data processing</p>
                <pre className="bg-gray-100 p-4 rounded text-sm">
                  {`Table: temp_fundraises
- Similar structure to processed_fundraises
- Used as staging area for data imports
- Data is validated and cleaned before moving to processed_fundraises`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle>Data Pipeline</CardTitle>
              <CardDescription>How data flows through the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">1. Data Ingestion</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Automated Twitter feed monitoring</li>
                  <li>CSV file imports for batch processing</li>
                  <li>Manual submissions through API</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Processing Pipeline</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>AI-powered data extraction using GPT-4</li>
                  <li>Data normalization and validation</li>
                  <li>Duplicate detection</li>
                  <li>Slug generation for unique identification</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Storage and Indexing</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Processed data stored in main database</li>
                  <li>Automatic indexing for efficient querying</li>
                  <li>Regular database maintenance and optimization</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Edge Functions</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm">
                  {`- scheduled-fetch: Runs every hour to fetch new submissions
- import-csv: Handles CSV file imports
- process-fundraising: AI-powered data extraction
- direct-import: Manual data imports via API`}
                </pre>
              </div>
            </CardContent>
          </Card>
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
const searchResults = await searchResponse.json();`}
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
      </Tabs>
    </div>
  );
};

export default ApiDocs;
