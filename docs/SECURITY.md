# Security Policy

## Content Security Policy (CSP)

This application implements a strict Content Security Policy to prevent XSS and other injection attacks.

### Current CSP Configuration

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://finnhub.io https://api.exchangerate-api.com;
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  object-src 'none';
```

### Directive Explanations

#### `default-src 'self'`
- **Purpose**: Default fallback for all resource types
- **Effect**: Only allow resources from the same origin

#### `script-src 'self'` ✅ **Strict**
- **Purpose**: Prevent script injection attacks
- **Effect**: Only allow scripts from the same origin
- **Security**: **NO** `unsafe-inline`, **NO** `unsafe-eval`
- **Protection**: Blocks all inline `<script>` tags and eval-like constructs

#### `style-src 'self' 'unsafe-inline'` ⚠️ **Relaxed (Temporary)**
- **Purpose**: Allow inline styles for gradual migration
- **Current**: `unsafe-inline` is allowed
- **Reason**: 20+ inline `style=""` attributes in index.html
- **Roadmap**: Gradually migrate inline styles to CSS classes
- **Risk**: Low (CSS injection is less dangerous than script injection)

#### `img-src 'self' data: https:`
- **Purpose**: Allow images from various sources
- **Sources**:
  - `'self'`: Local images
  - `data:`: Base64-encoded images (e.g., for icons)
  - `https:`: External HTTPS images (e.g., for stock logos)

#### `font-src 'self' data:`
- **Purpose**: Allow fonts
- **Sources**:
  - `'self'`: Local fonts
  - `data:`: Base64-encoded fonts

#### `connect-src 'self' https://finnhub.io https://api.exchangerate-api.com`
- **Purpose**: Control AJAX/fetch/WebSocket connections
- **Allowed APIs**:
  - `'self'`: Local API endpoints
  - `https://finnhub.io`: Stock price API
  - `https://api.exchangerate-api.com`: Exchange rate API

#### `base-uri 'self'`
- **Purpose**: Prevent `<base>` tag injection
- **Effect**: Only allow `<base>` tags pointing to same origin

#### `form-action 'self'`
- **Purpose**: Prevent form submission to external sites
- **Effect**: Forms can only submit to same origin

#### `frame-ancestors 'none'`
- **Purpose**: Prevent clickjacking
- **Effect**: This page cannot be embedded in `<iframe>`, `<frame>`, `<embed>`, or `<object>`
- **Alternative to**: X-Frame-Options: DENY

#### `object-src 'none'`
- **Purpose**: Block plugins
- **Effect**: No `<object>`, `<embed>`, or `<applet>` tags allowed

### Security Benefits

#### ✅ **Protected Against**
- **Script Injection (XSS)**: Blocked by strict `script-src 'self'`
- **Eval-based Attacks**: No `eval()`, `Function()`, `setTimeout(string)` allowed
- **Inline Script Attacks**: All inline `<script>` tags blocked
- **Clickjacking**: Blocked by `frame-ancestors 'none'`
- **Form Hijacking**: Blocked by `form-action 'self'`
- **Base Tag Injection**: Blocked by `base-uri 'self'`
- **Plugin-based Attacks**: Blocked by `object-src 'none'`

#### ⚠️ **Partial Protection**
- **CSS Injection**: Partially vulnerable due to `'unsafe-inline'` in `style-src`
  - **Risk Level**: Low-Medium
  - **Mitigation**: Input sanitization with DOMPurify
  - **Roadmap**: Remove `'unsafe-inline'` after migrating inline styles to classes

#### ✅ **Additional Security Measures**
- **XSS Prevention**: All user inputs are sanitized with `escapeHTML()` function
- **DOMPurify**: Used for sanitizing HTML content before innerHTML assignment
- **No eval()**: Codebase verified to contain zero eval-like constructs
- **HTTPS-Only Images**: External images require HTTPS

### CSP Violation Reporting

Currently, CSP violations are reported to the browser console. To enable server-side reporting, add:

```
report-uri /api/csp-violations;
report-to csp-endpoint;
```

### Future Improvements

#### Phase 1: Remove `'unsafe-inline'` from `style-src`
1. Migrate inline `style=""` attributes to CSS classes
2. Extract all inline styles from index.html
3. Add corresponding CSS rules to style.css
4. Update CSP to `style-src 'self'`

**Target**: 20 inline styles to migrate

#### Phase 2: Add CSP Reporting
1. Implement `/api/csp-violations` endpoint
2. Configure `report-uri` directive
3. Monitor and analyze violations
4. Adjust policy based on reports

#### Phase 3: Implement Subresource Integrity (SRI)
1. Add integrity hashes to external scripts (if any)
2. Add integrity hashes to external stylesheets (if any)

### Testing CSP

#### Manual Testing
1. Open browser DevTools → Console
2. Look for CSP violation warnings
3. Test all features to ensure nothing is blocked

#### Automated Testing
```bash
# Test with strict CSP
npm run build
npm run preview
# Navigate to http://localhost:4173 and test all features
```

#### CSP Validator Tools
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

### Reporting Security Issues

If you discover a security vulnerability, please email:
- **Contact**: [security email]
- **Response Time**: Within 48 hours
- **Disclosure**: Coordinated disclosure preferred

## Additional Security Measures

### Input Sanitization
All user inputs are sanitized using:
- `escapeHTML()`: Custom HTML entity encoding
- `DOMPurify.sanitize()`: For complex HTML structures

### Secure Storage
- **IndexedDB**: Used for portfolio data (client-side only)
- **No Sensitive Data**: No passwords or API keys stored locally
- **API Keys**: Loaded from environment variables only

### HTTPS Enforcement
- **Development**: HTTP allowed
- **Production**: HTTPS strongly recommended
- **CSP**: Could add `upgrade-insecure-requests` directive for automatic HTTPS upgrade

### Dependency Security
```bash
# Audit dependencies for known vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Update dependencies
npm update
```

### Security Headers (Recommended for Production)
When deploying to production, configure these headers on your web server:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### Last Updated
- **Date**: 2025-01-14
- **CSP Version**: 1.0
- **Next Review**: Phase 4.1b (Inline style migration)
