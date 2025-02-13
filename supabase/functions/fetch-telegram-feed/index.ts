
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Fetching Telegram feed...')
    
    // Add a user agent to avoid being blocked
    const response = await fetch('https://t.me/s/cryptofundraises', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch from Telegram:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log('Received HTML length:', html.length);

    if (html.length < 100) {
      console.error('Received suspiciously short HTML response:', html);
      throw new Error('Invalid response from Telegram');
    }

    // Log a sample of the HTML to debug the structure
    console.log('HTML sample:', html.substring(0, 500));

    // Updated regex patterns to be more specific to Telegram's HTML structure
    const messagePattern = /<div class="tgme_widget_message_wrap[^"]*">[\s\S]*?<div class="tgme_widget_message text_not_supported_wrap[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
    const textPattern = /<div class="tgme_widget_message_text js-message_text"[^>]*>([\s\S]*?)<\/div>/;
    const timePattern = /<time class="time" datetime="([^"]+)">/;

    const posts: { text: string; timestamp: string }[] = [];
    let messageMatch;

    while ((messageMatch = messagePattern.exec(html)) !== null) {
      const messageContent = messageMatch[1];
      console.log('Found message content:', messageContent.substring(0, 200));
      
      // Extract text content
      const textMatch = messageContent.match(textPattern);
      const timeMatch = messageContent.match(timePattern);
      
      if (textMatch && timeMatch) {
        const text = textMatch[1]
          .replace(/<br\/?>/g, '\n') // Replace <br> with newlines
          .replace(/<[^>]+>/g, '') // Remove other HTML tags
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();

        posts.push({
          text,
          timestamp: timeMatch[1]
        });
        
        console.log('Extracted post:', { text: text.substring(0, 100), timestamp: timeMatch[1] });
      } else {
        console.log('Failed to match text or time pattern:', { 
          hasTextMatch: !!textMatch, 
          hasTimeMatch: !!timeMatch 
        });
      }
    }

    console.log(`Found ${posts.length} posts in total`);

    if (posts.length === 0) {
      console.error('No posts found in the HTML. Message pattern might need updating.');
      // Log the full HTML for debugging (only in development)
      console.log('Full HTML:', html);
    }

    // Sort posts by timestamp (newest first) and take the most recent 10
    const recentPosts = posts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    console.log(`Returning ${recentPosts.length} most recent posts`);
    if (recentPosts.length > 0) {
      console.log('First post:', recentPosts[0]);
    }
    
    return new Response(JSON.stringify({ posts: recentPosts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching Telegram feed:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      posts: [] 
    }), {
      status: 200, // Return 200 even on error, but with empty posts
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
