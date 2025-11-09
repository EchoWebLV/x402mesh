# 📦 NPM Publishing Guide

This guide covers how to publish the `@x402mesh/sdk` and `@x402mesh/cli` packages to npm.

## ✅ Pre-Publishing Checklist

All items completed ✓:

- [x] Updated package.json with npm metadata
- [x] Added README.md for both packages
- [x] Created .npmignore files
- [x] Built all packages successfully
- [x] Added shebang to CLI
- [x] Set executable permissions

## 🔐 Prerequisites

### 1. Create npm Account

If you don't have one already:
```bash
# Create account at https://www.npmjs.com/signup
# Or use the CLI
npm adduser
```

### 2. Login to npm

```bash
npm login
```

Enter your credentials when prompted.

### 3. Verify Login

```bash
npm whoami
```

Should display your npm username.

## 📤 Publishing Steps

### Option A: Publish Both Packages (Recommended)

```bash
# Navigate to workspace root
cd /Users/yordanlasonov/Documents/GitHub/agent-2-agent-infra

# Publish SDK
cd packages/sdk
npm publish --access public

# Publish CLI
cd ../cli
npm publish --access public
```

### Option B: Publish One at a Time

**Publish SDK:**
```bash
cd /Users/yordanlasonov/Documents/GitHub/agent-2-agent-infra/packages/sdk
npm publish --access public
```

**Publish CLI:**
```bash
cd /Users/yordanlasonov/Documents/GitHub/agent-2-agent-infra/packages/cli
npm publish --access public
```

## 🧪 Test Before Publishing (Recommended)

### Dry Run

See what files will be included without actually publishing:

```bash
# For SDK
cd packages/sdk
npm pack --dry-run

# For CLI
cd packages/cli
npm pack --dry-run
```

### Create Local Package

Create a tarball to inspect:

```bash
# For SDK
cd packages/sdk
npm pack
# Creates: x402mesh-sdk-0.1.0-alpha.1.tgz

# For CLI
cd packages/cli
npm pack
# Creates: x402mesh-cli-0.1.0-alpha.1.tgz

# Inspect contents
tar -tzf x402mesh-sdk-0.1.0-alpha.1.tgz
tar -tzf x402mesh-cli-0.1.0-alpha.1.tgz

# Clean up
rm *.tgz
```

### Test Local Installation

```bash
# In SDK directory
npm pack
npm install -g ./x402mesh-sdk-0.1.0-alpha.1.tgz

# In CLI directory
npm pack
npm install -g ./x402mesh-cli-0.1.0-alpha.1.tgz

# Test CLI
x402mesh --help
```

## ✅ Verify Publication

After publishing, verify the packages:

### Check on npm Website

1. **SDK**: https://www.npmjs.com/package/@x402mesh/sdk
2. **CLI**: https://www.npmjs.com/package/@x402mesh/cli

### Install and Test

```bash
# Create test directory
mkdir /tmp/test-x402mesh
cd /tmp/test-x402mesh

# Test SDK
npm init -y
npm install @x402mesh/sdk
node -e "console.log(require('@x402mesh/sdk'))"

# Test CLI
npm install -g @x402mesh/cli
x402mesh --help
x402mesh --version

# Clean up
cd ~
rm -rf /tmp/test-x402mesh
```

## 🏷️ Managing Versions

### Current Version: 0.1.0-alpha.1

This is an alpha release, perfect for the hackathon!

### Future Releases

When you need to publish updates:

```bash
# Patch version (bug fixes): 0.1.0-alpha.1 → 0.1.0-alpha.2
npm version prerelease

# Or manually edit package.json version field
# Then rebuild and publish again
npm run build
npm publish --access public
```

### Version Guidelines

- `0.1.0-alpha.X` - Alpha releases (current)
- `0.1.0-beta.X` - Beta releases (more stable)
- `0.1.0-rc.X` - Release candidates
- `0.1.0` - First stable release
- `0.1.1` - Patch updates
- `0.2.0` - Minor updates (new features)
- `1.0.0` - Major release (production ready)

## 📋 What Gets Published

### SDK Package Includes:
```
dist/              # Compiled JavaScript + TypeScript definitions
README.md          # Package documentation
LICENSE            # MIT license
package.json       # Package metadata
```

### CLI Package Includes:
```
dist/              # Compiled JavaScript with executable
README.md          # Package documentation
LICENSE            # MIT license
package.json       # Package metadata
```

### Excluded (via .npmignore):
- Source TypeScript files (`src/`)
- Test files
- Config files (tsconfig.json, etc.)
- node_modules
- Development files

## 🚨 Common Issues

### "You must be logged in to publish packages"

```bash
npm login
npm whoami  # Verify
```

### "Package name too similar to existing packages"

The `@x402mesh` scope should be unique. If issues arise, you may need to:
1. Request the scope on npm
2. Or use a different scope name

### "403 Forbidden"

```bash
# Make sure you're logged in
npm whoami

# Ensure public access for scoped packages
npm publish --access public
```

### "version already exists"

```bash
# Bump the version
npm version prerelease

# Or manually edit package.json
# Then publish again
```

## 📊 Post-Publishing Tasks

### 1. Update Hackathon Submission

Add to your submission:
```
✅ Published to npm:
- @x402mesh/sdk: https://www.npmjs.com/package/@x402mesh/sdk
- @x402mesh/cli: https://www.npmjs.com/package/@x402mesh/cli

Try it now:
$ npm install @x402mesh/sdk
$ npm install -g @x402mesh/cli
```

### 2. Update README.md

Add npm badges to main README:

```markdown
[![npm SDK](https://img.shields.io/npm/v/@x402mesh/sdk.svg)](https://www.npmjs.com/package/@x402mesh/sdk)
[![npm CLI](https://img.shields.io/npm/v/@x402mesh/cli.svg)](https://www.npmjs.com/package/@x402mesh/cli)
```

### 3. Social Announcement

Tweet/post:
```
🚀 Just published @x402mesh to npm!

Build AI agents with payment capabilities on Solana:
📦 npm install @x402mesh/sdk
🛠️ npm install -g @x402mesh/cli

x402 protocol + Solana + AI agents = 🔥

#Solana #x402 #AIAgents
```

### 4. Demo Video Update

Mention in your demo:
- "Already published to npm"
- Show `npm install @x402mesh/sdk`
- Demonstrates it's production-ready

## 🎯 For the Hackathon

### Timing

**Publish NOW** - before submission deadline (November 11, 2025)

Benefits:
- ✅ Proves it's real and working
- ✅ Judges can actually install and test it
- ✅ Strengthens "Best x402 Dev Tool" submission
- ✅ Shows professional development practices
- ✅ Demonstrates commitment to open source

### In Your Submission

Highlight:
1. "Already published to npm - install and try it now!"
2. Include npm install commands in demo
3. Show npm package page in video
4. Reference downloads/usage stats (if any)

## 🔒 Security Notes

### Before Publishing:

1. **Remove sensitive data**:
   ```bash
   # Check for secrets
   grep -r "private.*key\|secret\|password\|api.*key" packages/
   ```

2. **Review package contents**:
   ```bash
   npm pack --dry-run
   ```

3. **Check .npmignore works**:
   ```bash
   # Verify source files excluded
   npm pack
   tar -tzf *.tgz | grep "src/"  # Should be empty
   ```

### After Publishing:

- Monitor for security issues
- Set up GitHub security alerts
- Keep dependencies updated

## 📞 Support

If you run into issues:

1. **npm docs**: https://docs.npmjs.com/
2. **npm support**: https://www.npmjs.com/support
3. **Stack Overflow**: Tag with `npm`

## ✅ Final Checklist

Before running `npm publish`:

- [ ] Logged into npm (`npm whoami`)
- [ ] Packages build successfully
- [ ] README files look good
- [ ] No sensitive data in packages
- [ ] Tested with `npm pack --dry-run`
- [ ] Ready to publish to the world! 🚀

## 🎬 Quick Publish Commands

```bash
# THE COMMANDS TO RUN:

cd /Users/yordanlasonov/Documents/GitHub/agent-2-agent-infra

# Make sure you're logged in
npm whoami

# Publish SDK
cd packages/sdk
npm publish --access public

# Publish CLI  
cd ../cli
npm publish --access public

# Verify
npm info @x402mesh/sdk
npm info @x402mesh/cli

# Done! 🎉
```

---

**Good luck with your hackathon submission! 🏆**

