
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
    const response = await fetch('https://t.me/s/crypto_fundraising')
    const html = await response.text()

    // Extract posts using regex
    const postsRegex = /<div class="tgme_widget_message_text js-message_text"[^>]*>([\s\S]*?)<\/div>/g
    const timeRegex = /<time class="time"[^>]*datetime="([^"]*)"[^>]*>/g
    
    const posts: { text: string; timestamp: string }[] = []
    let match
    let timeMatch

    while ((match = postsRegex.exec(html)) !== null && (timeMatch = timeRegex.exec(html)) !== null) {
      const text = match[1]
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim()

      posts.push({
        text,
        timestamp: timeMatch[1]
      })
    }

    // Return most recent 10 posts
    const recentPosts = posts.slice(0, 10)

    return new Response(JSON.stringify({ posts: recentPosts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching Telegram feed:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
