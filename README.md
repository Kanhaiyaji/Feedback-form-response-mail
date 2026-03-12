# Feedback Form (React + Vite)

This project includes a modern feedback form with EmailJS automation.

When a user submits the form, emails are sent to:
- Owner: kanhaiya***************@*******
- User: email entered in the form

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file from the example:

```bash
copy .env.example .env.local
```

3. Fill values in `.env.local`:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

4. Run the app:

```bash
npm run dev
```

## EmailJS Template Variables

Configure your EmailJS template using these variables:

- `to_email`
- `to_name`
- `from_name`
- `user_email`
- `rating`
- `user_type`
- `feedback`
- `submitted_at`

Example template content:

```txt
Hello {{to_name}},

New feedback received.

Name: {{from_name}}
Email: {{user_email}}
Rating: {{rating}}
Type: {{user_type}}
Feedback: {{feedback}}
Submitted At: {{submitted_at}}
```
FOR CHANGES
```
git add .
git commit -m "your message"
git push

```
