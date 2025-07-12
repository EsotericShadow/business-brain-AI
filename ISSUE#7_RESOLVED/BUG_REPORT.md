# Bug Report: Prisma `upsert` fails with `undefined` id

**ID:** ISSUE#7
**Date:** 2025-07-11
**Status:** Open
**Reporter:** Gemini

---

### 1. Description

The application's authentication flow fails during the Google OAuth callback. After a user successfully authenticates with Google and grants permissions, the backend throws a `PrismaClientValidationError`. The error indicates that the `where` clause of a `prisma.user.upsert()` call is receiving an `undefined` value for the `id` field.

This prevents the application from creating or updating a user in the database, breaking the entire login and user creation process. The user is redirected back to the home page with an `auth_failed` error.

### 2. Error Log

The following error is consistently logged in the backend terminal during the OAuth callback:

```
Authentication callback error: PrismaClientValidationError: 
Invalid `prisma.user.upsert()` invocation:

{
  where: {
    id: undefined,
    // ...
  },
  update: {
    // ...
  },
  create: {
    id: undefined,
    // ...
  }
}

Argument `where` of type UserWhereUniqueInput needs at least one of `id`, `email` or `stripeCustomerId` arguments.
```

### 3. Code Context

The error originates in the `findOrCreateUser` function within `backend/src/index.ts`. This function is called by the `/api/auth/google/callback` route handler.

**Relevant File: `backend/src/index.ts`**

```typescript
// ... (imports and middleware)

// --- User Management ---
const findOrCreateUser = async (googleProfile: { sub: string, email: string, name: string, picture: string }, tokens: { refreshToken?: string | null, accessToken?: string | null }): Promise<User> => {
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 30);

  const user = await prisma.user.upsert({
    where: { id: googleProfile.sub }, // <-- The error likely originates here
    update: {
      name: googleProfile.name,
      avatarUrl: googleProfile.picture,
      gmailAccessToken: tokens.accessToken,
      gmailRefreshToken: tokens.refreshToken,
    },
    create: {
      id: googleProfile.sub,
      email: googleProfile.email,
      name: googleProfile.name,
      avatarUrl: googleProfile.picture,
      gmailAccessToken: tokens.accessToken,
      gmailRefreshToken: tokens.refreshToken,
      trialEndsAt: trialEndDate,
      stripeCustomerId: (await stripe.customers.create({ email: googleProfile.email, name: googleProfile.name })).id,
    },
  });

  return user as User;
};

// ... (other routes)

// --- Authentication Routes ---
app.get('/api/auth/google/callback', async (req: express.Request, res: express.Response) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).redirect(`${config.CORS_ORIGIN}/?error=auth_failed`);
  }
  
  try {
    const tempUserId = 'temp-user-id'; 
    const authService = new GmailAuthService(tempUserId);
    const { accessToken, refreshToken, userInfo } = await authService.handleAuthCallback(code as string);
    
    // The `userInfo` object from the auth service is passed to `findOrCreateUser`
    const user = await findOrCreateUser(userInfo, { accessToken, refreshToken });
    
    const sessionToken = jwt.sign({ userId: user.id }, config.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${config.CORS_ORIGIN}/auth/callback?token=${sessionToken}`);
  } catch (error) {
    console.error('Authentication callback error:', error);
    res.status(500).redirect(`${config.CORS_ORIGIN}/?error=auth_failed`);
  }
});

// ... (server startup)
```

**Relevant File: `backend/src/services/gmail-auth.service.ts`**

This service is responsible for fetching the user's profile from Google.

```typescript
// ... (imports)

export class GmailAuthService {
  // ... (constructor and other methods)

  async handleAuthCallback(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    userInfo: any; // <-- This is the object being passed to findOrCreateUser
  }> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // Get user information
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      // ... (token storage)

      return {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        userInfo: userInfo.data // The data from the Google API response
      };
    } catch (error: any) {
      console.error("Authentication callback error:", error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  // ... (other methods)
}
```

### 4. Analysis & Hypothesis

The core of the issue is a mismatch between the data structure expected by `findOrCreateUser` and the data structure being returned by the `GmailAuthService`.

1.  The `findOrCreateUser` function expects a `googleProfile` object with a `sub` property to use as the unique `id`.
2.  The `GmailAuthService`'s `handleAuthCallback` method returns the `userInfo.data` object from the Google API.
3.  The error log clearly shows that `id` is `undefined` when `prisma.user.upsert` is called. This means that `googleProfile.sub` is `undefined`.
4.  Therefore, the `userInfo.data` object returned from the `google.oauth2.userinfo.get()` call does not contain a `sub` property. It likely has a different property for the user's unique ID (e.g., `id`).

The repeated attempts to fix this by modifying the `create` block of the `upsert` call have failed because the fundamental problem is in the `where` clause, which is receiving an `undefined` value.

### 5. Suggested Next Steps

1.  **Inspect the `userInfo.data` Object:** The immediate next step should be to log the `userInfo.data` object to the console right before it's passed to `findOrCreateUser`. This will reveal its exact structure and the name of the property that holds the unique user ID.
2.  **Correct the `id` Field:** Once the correct property name is identified (e.g., `id` instead of `sub`), update the `findOrCreateUser` function signature and the `upsert` call to use the correct property.

This targeted debugging approach should definitively resolve the issue.
