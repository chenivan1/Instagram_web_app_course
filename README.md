# Instagram_web_app_course
This repo is for an instagram application dedicated for the final project of Web applications programming course

## Twitter/X MCP integration
This project includes a `.mcp.json` config that connects a Twitter/X MCP server ([`@enescinar/twitter-mcp`](https://github.com/EnesCinr/twitter-mcp)) to Claude Code, so an assistant working in this repo can post tweets and search Twitter on request.

To use it, set these environment variables (from a [Twitter Developer](https://developer.twitter.com/) app with read/write access) before starting Claude Code:

```bash
export TWITTER_API_KEY=...
export TWITTER_API_SECRET=...
export TWITTER_ACCESS_TOKEN=...
export TWITTER_ACCESS_TOKEN_SECRET=...
```
