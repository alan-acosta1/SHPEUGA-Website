# Password recovery with Resend

Supabase Auth generates recovery tokens; Resend delivers the email over custom
SMTP. The default `ConfirmationURL` consumes a token on a GET request, including
visits by email scanners. The custom template instead opens the website with
`TokenHash` in a URL fragment. The reset page removes that fragment from the
address bar and verifies it only when the user submits a valid password form.
Verification always uses the `recovery` type. No token verification occurs on
page load, and a rejected token cannot fall back to an existing signed-in user.

## Production rollout (order matters)

1. Deploy the reset-page code from this change first. Previously sent default
   links continue to use the existing Supabase session flow.
2. In Supabase Authentication → URL Configuration, use the canonical Site URL
   `https://www.shpeuga.com` and allow these exact reset destinations:
   - `https://www.shpeuga.com/resetpassword`
   - `https://shpeuga.com/resetpassword`
   - `http://localhost:3000/resetpassword` only if local testing is needed.
3. In Authentication → Emails → Reset password, replace the body with
   `supabase/templates/recovery.html`. This template intentionally uses the
   canonical production host so the token stays on the correct origin. It is
   a hosted dashboard setting; committing the HTML does not apply it.
4. Request a fresh email using a test account you control. It should open
   `/resetpassword` on `www.shpeuga.com` and show the password form. Loading or
   refreshing the original email link must not issue a Supabase `/verify`
   request. Submit the form, then confirm login with the new password.
5. Reopening a consumed link should allow entering the form but report an
   invalid/used link on submission, with a link to request a replacement.

 token is kept only in component memory after the URL is cleared. If the
page is reloaded before submitting, reopen the original email link. Password
policy errors after successful verification can be corrected in the same form
without attempting to reuse the consumed token.

Do not replace the template before the code is deployed: the previous reset
page does not understand `recovery_token`. To roll back, restore the previous
email template before reverting the page code.

References:
- https://supabase.com/docs/guides/auth/auth-email-templates#email-prefetching
- https://supabase.com/docs/reference/javascript/auth-verifyotp
