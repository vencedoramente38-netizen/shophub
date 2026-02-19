# How to Push Your Project to GitHub

You are currently unable to use Git because **it is not installed** on your computer.

## Step 1: Install Git

1.  Download Git for Windows: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2.  Run the installer and click "Next" through the default options.
3.  **IMPORTANT**: After installing, you must **restart your computer** (or at least close and reopen your code editor/terminal) for the command to be recognized.

## Step 2: Push Your Code

You were trying to use `git clone`, but that command is for **downloading** files. To **upload** your current project to your new repository (`isfdsa`), follow these steps exactly in your terminal:

1.  Initialize Git in your project folder:
    ```bash
    git init
    ```

2.  Add all your files:
    ```bash
    git add .
    ```

3.  Save your changes (Commit):
    ```bash
    git commit -m "Initial commit"
    ```

4.  Rename the branch to main:
    ```bash
    git branch -M main
    ```

5.  Link your local project to your GitHub repository:
    ```bash
    git remote add origin https://github.com/helenacamposvmm-rgb/isfdsa.git
    ```

6.  Upload (Push) the files:
    ```bash
    git push -u origin main
    ```

> **Note:** If `git remote add` fails saying "remote origin already exists", run `git remote set-url origin https://github.com/helenacamposvmm-rgb/isfdsa.git` instead.
