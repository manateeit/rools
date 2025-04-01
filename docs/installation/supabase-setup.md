# Supabase Setup Guide for Trading AI Agent Bot

This guide provides detailed instructions for setting up Supabase for use with the Trading AI Agent Bot.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in.
2. Click on "New Project" to create a new project.
3. Enter a name for your project (e.g., "Trading AI Agent Bot").
4. Set a secure database password (you won't need this for normal operation, but keep it safe).
5. Choose a region closest to your users for optimal performance.
6. Click "Create new project" and wait for the project to be created (this may take a few minutes).

## 2. Get Your API Keys

Once your project is created, you'll need to get your API keys:

1. In the Supabase dashboard, go to "Settings" (gear icon) in the left sidebar.
2. Click on "API" in the settings menu.
3. You'll see two keys:
   - **anon public**: This is your `SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role**: This is your `SUPABASE_SERVICE_ROLE_KEY`
4. Copy these keys and keep them secure.

## 3. Get Your Project URL

You'll also need your project URL:

1. In the API settings page, look for "Project URL".
2. Copy this URL - this is your `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`.

## 4. Set Up Database Schema

The Trading AI Agent Bot requires specific database tables. You can set these up using the provided SQL schema:

1. In the Supabase dashboard, go to "SQL Editor" in the left sidebar.
2. Click "New Query".
3. Copy and paste the contents of `config/supabase-schema.sql` into the editor.
4. Click "Run" to execute the SQL and create the necessary tables.

The schema will create the following tables:

- `profiles`: User profile information
- `api_keys`: Encrypted API keys for external services
- `user_preferences`: User preferences and settings
- `trades`: Record of executed trades
- `positions`: Current positions
- `backtests`: Backtest configurations and results
- `strategies`: Trading strategy configurations
- `model_performance`: Performance metrics for LLM models

## 5. Configure Authentication

To enable authentication for the Trading AI Agent Bot:

1. In the Supabase dashboard, go to "Authentication" in the left sidebar.
2. Click on "Settings" (under Authentication).
3. Configure the following settings:
   - **Site URL**: Set this to your application URL (e.g., `http://localhost:3000` for development or your production URL)
   - **Redirect URLs**: Add your application URLs (e.g., `http://localhost:3000/login`, `http://localhost:3000/callback`)
4. Go to "Providers" and ensure "Email" is enabled.
5. Optionally, configure additional providers like Google, GitHub, etc.

## 6. Configure Email Templates (Optional)

If you want to customize the authentication emails:

1. In the Authentication settings, click on "Email Templates".
2. Customize the templates for:
   - Confirmation email
   - Invitation email
   - Magic link email
   - Reset password email

## 7. Set Up Storage Buckets (Optional)

If your application needs to store files:

1. In the Supabase dashboard, go to "Storage" in the left sidebar.
2. Click "Create new bucket".
3. Name your bucket (e.g., "user-files").
4. Configure bucket permissions:
   - For public files: Set RLS (Row Level Security) to public
   - For private files: Enable RLS and create appropriate policies

## 8. Update Environment Variables

Update your `.env` file with the Supabase credentials:

```
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Next.js Public Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 9. Create a Test User

For testing purposes, you may want to create a test user:

1. In the Supabase dashboard, go to "Authentication" in the left sidebar.
2. Click on "Users".
3. Click "Invite user".
4. Enter an email address and click "Invite".
5. Check the email for the invitation link and set a password.

Alternatively, you can sign up through your application once it's running.

## 10. Row Level Security (RLS) Policies

The SQL schema includes RLS policies to ensure users can only access their own data. These policies are automatically set up when you run the schema SQL.

To verify the policies:

1. In the Supabase dashboard, go to "Table Editor" in the left sidebar.
2. Select a table (e.g., "profiles").
3. Click on "Policies" to view the RLS policies for that table.

## 11. Testing the Connection

Once you've set up Supabase and configured your environment variables, you can test the connection:

1. Start your application:
   ```bash
   npm run dev
   ```

2. Try to sign up or log in through the application.

3. If successful, you should be able to access the dashboard and other protected routes.

## Troubleshooting

If you encounter issues with Supabase:

1. **Authentication Issues**:
   - Check that your Site URL and Redirect URLs are correctly configured.
   - Ensure your environment variables are correctly set.
   - Check the browser console for CORS errors.

2. **Database Issues**:
   - Verify that the SQL schema was executed successfully.
   - Check the RLS policies to ensure they're not too restrictive.
   - Use the SQL Editor to query tables directly and check data.

3. **API Key Issues**:
   - Ensure you're using the correct keys (anon key for client-side, service role key for server-side).
   - Check that your keys haven't expired or been revoked.

4. **CORS Issues**:
   - Add your application URL to the allowed origins in the Supabase dashboard (API settings).

## Next Steps

After setting up Supabase, you can:

1. Configure your Alpaca API integration.
2. Set up your LLM provider (OpenAI, etc.).
3. Start using the Trading AI Agent Bot.

For more information, refer to the [Installation Guide](installation.md) and [Configuration Guide](configuration.md).