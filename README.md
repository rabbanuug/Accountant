# Accountant & Client System

This is a complete system with a Laravel Web App (for Accountants) and an Expo Mobile App (for Clients).

## Prerequisites
- PHP 8.2+
- Composer
- Node.js & npm
- MySQL

## Setup & Run

### 0. Secrets Management (SOPS & Age)

This project uses **[Mozilla SOPS](https://github.com/getsops/sops)** (Secrets OPerationS) and **[Age](https://github.com/FiloSottile/age)** encryption to safely store secrets (like `.env` files) directly in the Git repository.

#### What is SOPS?

SOPS is an editor for encrypted files. Unlike regular encryption that turns your entire file into an unreadable blob, SOPS **only encrypts the values** while keeping the keys/structure in plain text. This means:

- ✅ You can see *what* secrets exist (e.g., `DB_PASSWORD=`) in Git diffs
- ✅ You can safely push encrypted `.env` files to Git
- ✅ Merge conflicts are easier to resolve because the structure is readable
- ❌ The actual secret *values* remain fully encrypted and unreadable without the private key

#### What is Age?

Age is a simple, modern encryption tool used by SOPS to encrypt/decrypt values. It uses a **public/private key pair**:
- **Public key** — stored in `.sops.yaml` (committed to Git), used to *encrypt*
- **Private key** — stored in `~/.sops/key.txt` (NEVER committed), used to *decrypt*

---

#### Step 1: Install SOPS & Age

**macOS:**
```bash
brew install sops age
```

**Ubuntu/Debian:**
```bash
# Age
sudo apt install age

# SOPS (download latest binary from GitHub)
# For amd64:
curl -LO https://github.com/getsops/sops/releases/download/v3.9.4/sops-v3.9.4.linux.amd64
# For arm64:
curl -LO https://github.com/getsops/sops/releases/download/v3.9.4/sops-v3.9.4.linux.arm64

chmod +x sops-v3.9.4.linux.*
sudo mv sops-v3.9.4.linux.* /usr/local/bin/sops
```

**Verify installation:**
```bash
sops --version   # should output: sops 3.x.x
age --version    # should output: v1.x.x
```

---

#### Step 2: Get the Private Key

> ⚠️ **You must get the project's Age private key from a team lead or password manager. NEVER send it over Slack, email, or any unencrypted channel.**

Once you have the `key.txt` file, store it securely:

```bash
mkdir -p ~/.sops
cp /path/to/key.txt ~/.sops/key.txt
chmod 600 ~/.sops/key.txt
```

Then tell SOPS where to find it by adding this to your `~/.bashrc` (or `~/.zshrc`):

```bash
export SOPS_AGE_KEY_FILE=~/.sops/key.txt
```

Reload your shell:
```bash
source ~/.bashrc
```

---

#### Step 3: Understanding the Project Config

The file `web/.sops.yaml` tells SOPS which files to encrypt and which public key to use:

```yaml
creation_rules:
  - path_regex: ^\.env(\..+)?$
    age: age12eww96gry0ye8lq75szxae7m8qjdhx9dx0tn39gzhcqfvksvuchs7m9ly8
```

This means any file matching `.env`, `.env.dev`, `.env.prod`, `.env.local`, etc. inside `web/` will be encrypted with this project's Age public key.

The `web/.gitignore` is configured to:
- **Ignore** plaintext `.env` files (so you don't accidentally push them)
- **Allow** encrypted `.env.*.enc` files (safe to push)

---

#### Step 4: Daily Usage — Common Commands

All commands below should be run from the **project root** (`Accountant/`).

##### 🔐 Encrypt a plaintext `.env` file

```bash
# Encrypt and output to a new .enc file (keeps original intact)
sops --encrypt web/.env > web/.env.enc

# OR encrypt in-place (replaces the file contents with encrypted version)
sops --encrypt --in-place web/.env
```

##### 🔓 Decrypt an encrypted `.env` file

```bash
# Decrypt to stdout (useful for piping or inspection)
sops --decrypt web/.env.enc

# Decrypt and save to a plaintext file
sops --decrypt web/.env.enc > web/.env
```

##### ✏️ Edit secrets directly (RECOMMENDED)

This is the easiest way to change secrets. SOPS will decrypt the file in memory, open your terminal editor (`$EDITOR`), and re-encrypt automatically when you save and close:

```bash
sops web/.env
```

> 💡 **Tip:** Set your preferred editor with `export EDITOR=nano` (or `vim`, `code --wait`, etc.) in your `~/.bashrc`.

##### 👀 View encrypted file without decrypting

Just open the file normally — you'll see the keys in plain text but the values will look like:
```
DB_PASSWORD=ENC[AES256_GCM,data:abc123...,iv:...,tag:...,type:str]
```

---

#### Step 5: Git Workflow

Here's the typical workflow for working with secrets in this project:

```
1. Clone the repo
2. Get key.txt from team lead → save to ~/.sops/key.txt
3. Set SOPS_AGE_KEY_FILE in ~/.bashrc
4. Decrypt: sops --decrypt web/.env.enc > web/.env
5. Work normally with your local plaintext .env
6. When you need to update a secret:
   a. Run: sops web/.env.enc          (edit → save → auto re-encrypts)
   b. OR update web/.env then run: sops --encrypt web/.env > web/.env.enc
7. Commit and push the encrypted .env.enc file
```

**What gets committed to Git:**
| File | Committed? | Why |
|------|-----------|-----|
| `web/.env` | ❌ No | Plaintext secrets — blocked by `.gitignore` |
| `web/.env.enc` | ✅ Yes | Encrypted — safe to push |
| `web/.env.example` | ✅ Yes | Template with no real values |
| `web/.sops.yaml` | ✅ Yes | Public key config — safe to share |
| `~/.sops/key.txt` | ❌ Never | Private key — must stay local |

---

#### Step 6: CI/CD & Docker Usage

In CI/CD pipelines or Docker, you'll need to decrypt the `.env` before the app can use it.

**GitHub Actions example:**
```yaml
- name: Decrypt secrets
  env:
    SOPS_AGE_KEY: ${{ secrets.SOPS_AGE_KEY }}
  run: |
    sops --decrypt web/.env.enc > web/.env
```

> Store the **contents** of `key.txt` as a GitHub Actions secret named `SOPS_AGE_KEY`.

**Docker Compose example:**
```bash
# Decrypt before running docker compose
sops --decrypt web/.env.enc > web/.env
docker compose up -d
```

---

#### Troubleshooting

| Problem | Solution |
|---------|----------|
| `error: no matching keys found` | Your `key.txt` doesn't match the public key in `.sops.yaml`. Get the correct key from your team lead. |
| `error: could not load age key` | `SOPS_AGE_KEY_FILE` is not set or points to the wrong path. Run `echo $SOPS_AGE_KEY_FILE` to check. |
| `error: cannot open file` | Make sure you're in the right directory. SOPS uses the `.sops.yaml` relative to the file being encrypted. |
| File looks garbled after encrypt | That's normal! The values are encrypted. Use `sops --decrypt` to read them. |
| `key.txt` accidentally committed | **Immediately rotate the key!** Generate a new key pair with `age-keygen`, update `.sops.yaml`, re-encrypt all files, and revoke the old key. |

---

#### Quick Reference Card

```bash
# ---- Setup (one-time) ----
mkdir -p ~/.sops && cp key.txt ~/.sops/key.txt
echo 'export SOPS_AGE_KEY_FILE=~/.sops/key.txt' >> ~/.bashrc
source ~/.bashrc

# ---- Encrypt ----
sops --encrypt web/.env > web/.env.enc          # to new file
sops --encrypt --in-place web/.env              # in-place

# ---- Decrypt ----
sops --decrypt web/.env.enc > web/.env          # to new file
sops --decrypt web/.env.enc                      # to stdout

# ---- Edit (best way) ----
sops web/.env.enc                                # opens editor, auto re-encrypts

# ---- Generate new key (admin only) ----
age-keygen -o key.txt
# Copy the public key (age1...) into .sops.yaml
```

### 1. Database
The MySQL database `acc` has been created.
Credentials used:
- Host: `127.0.0.1`
- Port: `3306`
- Username: `root`
- Password: (empty)

### 2. Web App (Back Office / API)
The web application is built with Laravel 11.

**Run the server:**
```bash
cd web
php artisan serve
```
Access at: http://localhost:8000

**Features:**
- Register/Login (User will be assigned 'Accountant' role).
- Dashboard: View list of Clients.
- Chat: Select a client and chat in real-time.

### 3. Mobile App (Client)
The mobile application is built with Expo (React Native).

**Run the app:**
```bash
cd mobile
npx expo start
```
- Press `a` for Android Emulator.
- Press `w` for Web (might need CORS config).
- Scan QR code with Expo Go on your phone.

**Features:**
- Register/Login (User will be assigned 'Client' role).
- Home: View list of Accountants having 'Accountant' role.
- Chat: Select an accountant and chat.

## Testing the Flow
1. **Web**: Register a new user (e.g., Accountant A).
2. **Mobile**: Register a new user (e.g., Client B).
3. **Web**: You should see Client B in the Dashboard list.
4. **Mobile**: You should see Accountant A in the Home list.
5. **Chat**: Send a message from Mobile to Accountant A. Refresh Web dashboard (or wait for poll) to see the message. Reply from Web.

## Notes
- The mobile app API URL is set to `http://10.0.2.2:8000/api` for Android Emulator. Change it in `mobile/services/api.ts` if using a physical device (use your PC's IP address) or iOS Simulator (`http://localhost:8000/api`).
