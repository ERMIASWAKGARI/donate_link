# 🌍 Online Donation Platform through NGOs

## 📌 Project Overview
**Tech Stack:** MongoDB, Express.js, React.js, Node.js (MERN)

**Goal:** Provide a platform for users to donate to NGOs securely.

### 👥 Team Members:
- **Murtessa** (Project Manager)
- **Kuma** (Backend)
- **Ermias** (Backend)
- **Temsgen** (Frontend)
- **Biniam** (Frontend)

---
## ⚙️ Backend Setup
### **Environment Variables (.env)**
Create a `.env` file in the root directory and add the following:

```sh
MONGO_URI=mongodb+srv://murtessajabesa65:murtee1122@cluster0.t8hgd.mongodb.net/donations?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
```

### **Clone and Set Up Backend Repository**
```sh
git clone https://github.com/murtessa/Online-Donation-Platform-through-NGOs
cd backend
```

---
## 🎨 Frontend Setup
### **Clone and Set Up Frontend Repository**
```sh
git clone https://github.com/murtessa/Online-Donation-Platform-through-NGOs
cd frontend
```

---
## 🔥 General Git Rules

### **1️⃣ Pull from Main Before Starting Work**
Before starting any new task, ensure you pull the latest changes from the main branch:
```sh
git checkout main
git pull origin main
```

### **2️⃣ Create a New Branch Before Making Changes**
Create your own branch before making any modifications:
```sh
git checkout -b your-branch-name
```
Name your branches descriptively, ideally including the task or feature name, e.g., `feature/user-authentication`.

### **3️⃣ Commit Regularly and Push to Your Branch Only**
Make frequent, meaningful commits to your branch. Push your changes only to your branch:
```sh
git push origin your-branch-name
```

### **🚫 Never Push Directly to Main**
Do **NOT** push changes directly to the `main` branch. This prevents breaking the main branch inadvertently.

### **🔄 Periodic Merging by a Designated Person**
A designated team member will be responsible for merging branches into `main`, reviewing pull requests, resolving conflicts, and maintaining stability.

### **⚔️ Handling Conflicts**
If you encounter conflicts, resolve them carefully by following these steps:
```sh
git stash
git pull origin main
git stash pop
```
If conflicts persist, do not leave them unresolved. Seek help from your teammates.

### **❌ Avoid Force Pushing**
Never use `git push --force` as it can overwrite commits and cause loss of work.

---
## 📌 Summary
✅ Always pull from `main` before starting work.  
✅ Create your own branch for each new task.  
✅ Commit and push to your branch only.  
✅ Never push directly to `main`.  
✅ A designated person handles merging into `main`.  
✅ Resolve conflicts carefully and never use force push.  

By following these guidelines, we ensure a **smooth workflow, minimize conflicts, and maintain a stable main branch.** 🚀

