
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
    const response = await fetch('https://t.me/s/cryptofundraises')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const html = await response.text()
    console.log('Received HTML length:', html.length)

    // Updated regex patterns to be more specific to Telegram's HTML structure
    const messagePattern = /<div class="tgme_widget_message_wrap[^"]*">[\s\S]*?<div class="tgme_widget_message[^"]*"[^>]*>([\s\S]*?)<\/div>/g
    const textPattern = /<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/
    const timePattern = /<time class="time" datetime="([^"]+)">/

    const posts: { text: string; timestamp: string }[] = []
    let messageMatch

    while ((messageMatch = messagePattern.exec(html)) !== null) {
      const messageContent = messageMatch[1]
      
      // Extract text content
      const textMatch = messageContent.match(textPattern)
      const timeMatch = messageContent.match(timePattern)
      
      if (textMatch && timeMatch) {
        const text = textMatch[1]
          .replace(/<br\/?>/g, '\n') // Replace <br> with newlines
          .replace(/<[^>]+>/g, '') // Remove other HTML tags
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
    }

    console.log(`Found ${posts.length} posts in total`)

    // Sort posts by timestamp (newest first) and take the most recent 10
    const recentPosts = posts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    console.log(`Returning ${recentPosts.length} most recent posts`)
    console.log('First post:', recentPosts[0])
    
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
