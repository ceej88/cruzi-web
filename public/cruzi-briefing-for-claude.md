# Cruzi - Complete Briefing Document
# Give this entire document to Claude (or any AI assistant) to get help with marketing, strategy, and go-to-market

---

## WHO I AM

I am Ceejay Maher, founder of Cruzi. I am NOT a driving instructor (ADI). I am a tech entrepreneur building a platform for the UK driving instruction industry. I am dyslexic, so I need communications to be clear, simple, and well-structured. I don't have direct access to ADI Facebook groups or instructor communities.

---

## WHAT CRUZI IS

Cruzi is a mobile app (iOS and Android) for UK driving instructors and their students. It is the smartest way to manage driving lessons, track student progress, and run a driving instruction business.

Think of it as an all-in-one business tool for independent driving instructors - combining their diary, student records, payments, lesson planning, and communication into one app.

### The Problem We Solve

Right now, most UK driving instructors use:
- A paper diary or basic calendar app for scheduling
- WhatsApp for all student communication
- A notebook or spreadsheet to track student progress
- Manual invoicing or cash payments
- No structured lesson planning

This is messy, unprofessional, and means instructors lose track of student progress, miss payments, and waste time on admin instead of teaching.

### Our Solution

Cruzi replaces all of that with one professional app that:
- Manages their entire diary with smart scheduling
- Tracks student progress across all 38 DVSA syllabus topics
- Handles payments through a student wallet system
- Generates AI-powered lesson plans based on student skill levels
- Sends notifications and reminders automatically
- Records mock tests and tracks test readiness
- Provides AI coaching tools for students

---

## WHO OUR CUSTOMERS ARE

### Primary Customer: Independent ADIs (Approved Driving Instructors)
- There are approximately 40,000 ADIs in the UK
- Most are self-employed sole traders
- They typically have 10-30 active students at any time
- They charge 30-45 per hour for lessons
- Most are not very tech-savvy but all use smartphones
- They are active on Facebook in groups like "ADI Network" and "Driving Instructor Chat"
- Pain points: admin overload, tracking payments, remembering what each student needs to work on, planning lessons

### Secondary Customer: Learner Drivers (Students)
- Students download the app for free to connect with their instructor
- They use it to book lessons, track their own progress, see lesson plans, and pay for lessons
- There are roughly 1.5 million active learner drivers in the UK at any time
- They are typically 17-25 years old and very comfortable with apps

### Tertiary Customer: Driving Schools
- Large multi-instructor organisations (like AA Driving School, RED, Total Drive)
- They manage multiple instructors and want oversight of all students and lessons
- School Plan at 49.99/month covers up to 10 instructors

---

## HOW WE MAKE MONEY

### Subscription Model (Freemium)
All subscriptions are purchased on the Cruzi WEBSITE (cruzi.co.uk), not in the app. This is the "Companion App" model for Apple App Store compliance.

| Plan | Price | Student Limit |
|------|-------|---------------|
| Free | 0 | 5 students |
| Pro | 14.99/month | 15 students |
| Premium | 24.99/month | Unlimited students |
| School Plan | 49.99/month | Up to 10 instructors |

### Transaction Revenue
- Students top up their wallet with real money (via Stripe) to pay for lessons
- This happens IN the app because driving lessons are a physical service (allowed by Apple)
- We could take a small transaction fee in future

### SMS Credits
- Instructors can buy SMS credits on the website to send text reminders to students
- Powered by Twilio

---

## CURRENT STATUS (March 2026)

### What's Built and Working
- Full iOS mobile app (React Native / Expo)
- Full web application at cruzi.co.uk
- 23 database tables with Row Level Security
- 25 Supabase Edge Functions (AI, payments, SMS, notifications)
- Supabase authentication (email/password)
- Stripe payment integration
- Twilio SMS integration

### App Store Status
- iOS app submitted to Apple App Store for review (build 1.0.0)
- Awaiting Apple's review (typically 1-3 days)
- Android build not yet submitted to Google Play (ready to build)
- Apple Developer account and Google Play Developer account both set up

### What's NOT Done Yet
- Android app not yet on Google Play
- Marketing website needs improvement (cruzi.co.uk)
- No social media presence yet
- No users yet (apart from test accounts)
- Push notifications system in development
- Email notification system in development

---

## KEY FEATURES (For Marketing Copy)

### For Instructors
1. **Smart Diary** - Calendar with drag-and-drop rescheduling, colour-coded lesson types, block time management
2. **DVSA Core Skills Tracking** - Track student progress across all 38 DVSA syllabus topics with 1-5 scoring
3. **Test Readiness Score** - Automatic percentage based on 27 core DVSA DL25 competencies
4. **AI Lesson Plans** - Auto-generated lesson plans based on each student's skill gaps and history
5. **Voice Scribe** - Record lesson notes by voice, AI transcribes and creates structured session logs
6. **Student Wallet & Payments** - Students pre-pay into a wallet, automatic deductions per lesson
7. **Mock Test Recording** - Record mock tests with all 26 DVSA fault categories
8. **Achievement Badges** - 15 badges students can earn to stay motivated
9. **Template Vault** - Save and reuse lesson plan templates
10. **Smart Gaps** - When a lesson cancels, automatically notify students about the available slot
11. **Test Routes** - Record and share test centre routes with GPS tracking
12. **DVSA Insights** - Upload and analyse official DVSA test data reports
13. **Admin Helper** - AI alerts for payment reminders, inactive students, empty slots
14. **Connection Hub** - Link with students via invite codes and PINs
15. **Custom Lesson Types** - Define your own lesson types with custom prices, durations, and colours
16. **Cruzi Intelligence** - AI assistant that answers questions about your students and business data

### For Students
1. **Book Lessons** - Request and book lessons directly in the app
2. **Track Progress** - See your skill scores and test readiness percentage
3. **Cruzi Mentor** - AI chat coach for driving theory and practice questions
4. **Local Intel** - AI-generated info about tricky spots near your test centre
5. **Solo Practice** - GPS-tracked practice sessions with test route overlay
6. **Parent Plan** - Structured supervised practice plans for parents
7. **Learning Path** - Personalised learning journey shared by your instructor
8. **Achievements** - Earn badges as you progress through your learning
9. **Wallet** - Top up and pay for lessons in-app
10. **Messages** - Direct communication with your instructor

### For Driving Schools
1. **School Dashboard** - Overview of all instructors and students
2. **Instructor Management** - Invite, approve, and manage instructors
3. **Student Enquiries** - Manage new student enquiries and allocate to instructors
4. **School Plan** - One subscription covers up to 10 instructors

---

## COMPETITIVE LANDSCAPE

### Direct Competitors
- **My Driving Academy** - Basic student tracking app, limited features
- **Drive Buddy** - Scheduling focused, no AI features
- **ADI Manager** - Desktop software, not mobile-first
- **Instructor Hub** - Basic diary app

### Our Advantages
- AI-powered features (lesson planning, voice notes, student coaching)
- Complete ecosystem (instructor + student + school)
- Modern, professional design
- DVSA-aligned skill tracking (38 topics, DL25 competencies)
- Free tier to get instructors started
- Student app is free (instructors bring their students)

---

## BRAND IDENTITY

- **Name**: Cruzi
- **Tagline**: "The smarter way to manage driving lessons"
- **Primary Colour**: Purple (#7c3aed / #8B5CF6)
- **Design Style**: Glass-morphism, modern, clean
- **Fonts**: Inter (body), Outfit (headings)
- **Website**: cruzi.co.uk
- **Currency**: GBP only
- **Market**: UK only (for now)

---

## WHAT I NEED HELP WITH

### Immediate Priorities
1. **Go-to-market strategy** - How to get my first 50-100 instructors signed up
2. **Social media content** - Posts for Instagram, TikTok, LinkedIn, Twitter/X
3. **Outreach messages** - Cold emails/DMs to driving instructors I find online
4. **Website copy** - Improving cruzi.co.uk to convert visitors
5. **App Store optimisation** - Keywords, description, screenshots strategy
6. **Press/PR** - Getting coverage in driving instructor publications and websites

### Key Challenges
- I am NOT an ADI so I can't access private instructor Facebook groups
- I don't have an existing network of driving instructors
- I need to build trust with an industry I'm not personally part of
- Instructors may be skeptical of a non-instructor building their tool
- Budget is limited - need organic/low-cost growth strategies

### Industry Publications and Communities to Target
- Intelligent Instructor magazine (intelligentinstructor.co.uk)
- Driving Instructor magazine
- DVSA official channels
- Local ADI associations
- ADI National Joint Council
- Approved Driving Instructors National Association (ADINJA)
- Motor Schools Association (MSA)
- Driving Instructors Association (DIA)

### Potential Partnership Opportunities
- Driving test centres (leaflet distribution)
- Insurance companies that specialise in driving instructor insurance
- Car dealerships that sell dual-control cars
- Dual control fitting companies
- Theory test preparation apps (cross-promotion)

---

## TONE OF VOICE

When writing for Cruzi, use:
- Professional but friendly
- Simple, clear language (founder is dyslexic, and many instructors prefer straightforward communication)
- Confident but not arrogant
- Focus on saving time and being more professional
- Avoid jargon unless it's industry-specific (DVSA, ADI, DL25 are fine)
- British English spelling (colour, organisation, centre)

---

## ELEVATOR PITCH

"Cruzi is a free mobile app that helps driving instructors manage their entire business from their phone. Track student progress across all 38 DVSA topics, schedule lessons, take payments, and get AI-generated lesson plans - all in one place. Students get their own app to book lessons, track progress, and practice between sessions. It's like having a personal business assistant that actually understands driving instruction."

---

## KEY STATS TO USE IN MARKETING

- 38 DVSA syllabus topics tracked
- 27 core DL25 competencies for test readiness scoring
- 26 DVSA fault categories for mock test recording
- 15 achievement badges for student motivation
- 5 AI-powered student features
- Free to download, free to start with up to 5 students
- Works on iPhone and Android (Android coming soon)

---

## DEMO ACCOUNTS (for showing the app)

- Instructor: review@cruzi.co.uk / Tyreese2017@
- Student: student-review@cruzi.co.uk / Tyreese2017@
- Student is linked to instructor with sample data

---

## USEFUL LINKS

- Website: https://cruzi.co.uk
- Privacy Policy: https://cruzi.co.uk/privacy
- Terms of Service: https://cruzi.co.uk/terms
- App Store: (pending approval, link will be available after review)
- Google Play: (coming soon)
