# 🌍 Online Donation Platform through NGOs

### 📌 Project Overview

- **Tech Stack:** MongoDB, Express.js, React.js, Node.js (MERN)
- **Goal:** Provide a platform for users to donate to NGOs securely.
- **Team Members:**
  - [Murtessa] (Project Manager)
  - [Kuma] (Backend)
  - [Ermias] (Backend)
  - [Temsgen] (Frontend)
  - [Biniam] (Frontend)

  ## For Backends

  .env
  MONGO_URI=mongodb+srv://murtessajabesa65:murtee1122@cluster0.t8hgd.mongodb.net/donations?retryWrites=true&w=majority&appName=Cluster0
  PORT=5000

# Repository URL

git clone https://github.com/murtessa/Online-Donation-Platform-through-NGOs
cd backend

## For Frontend

# Repository URL

git clone https://github.com/murtessa/Online-Donation-Platform-through-NGOs
cd frontend

# General Rules

1. Pull from Main Before Starting Work

Before starting any new task, ensure you pull the latest changes from the main branch to stay up-to-date:
git checkout main
git pull origin main 

2. Create a New Branch Before Making Any Change/Commit on Your Task

Create your own branch before:
git checkout -b your-branch-name
Name your branches descriptively, ideally including the task or feature name, e.g., feature/user-authentication. 

3. Commit Regularly and Push to Your Branch Only

Make frequent, meaningful commits to your branch.
Push your changes to your branch only:
git push origin your-branch-name
Never Push Directly to Main

4. Do not push changes directly to the main branch. This helps prevent breaking the main branch inadvertently.
   Periodic Merging by Designated Person

A designated person will be responsible for merging branches into the main branch periodically.
They will review the pull requests, resolve conflicts, and ensure the main branch remains stable. 5. Handling Conflicts

If you encounter conflicts, attempt to resolve them by reverting to your last stable code and incorporating your changes again:
git stash
git pull origin main
git stash pop
If conflicts affect your code, do not leave them unresolved. Seek help from your teammates. 6. Avoid Force Pushing

Never use git push --force as it can overwrite commits and cause loss of work.

## Summary

1.Always pull from main before starting work.
2.Create your own branch for any new task.
3.Commit and push to your branch only.
4.Never push directly to main.
5.A designated person will handle merging into the main branch.
5.Resolve conflicts with help if needed and never use force push.
By following these guidelines, we ensure a smooth workflow, minimize conflicts, and maintain a stable main branch.
