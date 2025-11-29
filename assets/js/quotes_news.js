// Quotes and News for Edumate - education & tech focused
// Contains up to 50 quotes and 50 news items. Exposes helpers on window.
(function(window){
  const QUOTES = [
    { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { text: "Learning is not attained by chance, it must be sought for with ardor and diligence.", author: "Abigail Adams" },
    { text: "The beautiful thing about learning is nobody can take it away from you.", author: "B.B. King" },
    { text: "Technology will not replace great teachers but technology in the hands of great teachers can be transformational.", author: "George Couros" },
    { text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin" },
    { text: "The illiterate of the 21st century will not be those who cannot read and write, but those who cannot learn, unlearn, and relearn.", author: "Alvin Toffler" },
    { text: "Curiosity is the wick in the candle of learning.", author: "William Arthur Ward" },
    { text: "The purpose of education is to replace an empty mind with an open one.", author: "Malcolm Forbes" },
    { text: "It is the supreme art of the teacher to awaken joy in creative expression and knowledge.", author: "Albert Einstein" },
    { text: "Coding is today's language of creativity. All our children deserve a chance to become creators instead of consumers of computer science.", author: "Maria Klawe" },
    { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "William Butler Yeats" },
    { text: "The great aim of education is not knowledge but action.", author: "Herbert Spencer" },
    { text: "We learn more by looking for the answer to a question and not finding it than we do from learning the answer itself.", author: "Lloyd Alexander" },
    { text: "Technology is best when it brings people together.", author: "Matt Mullenweg" },
    { text: "You can never be overdressed or overeducated.", author: "Oscar Wilde" },
    { text: "Education's purpose is to replace an empty mind with an open one.", author: "Unknown" },
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "Simplicity is the soul of efficiency in UX and learning.", author: "Design Wisdom" },
    { text: "Learning is a treasure that will follow its owner everywhere.", author: "Chinese Proverb" },
    { text: "Great teachers empathize with kids, respect them, and believe that each one has something special that can be built upon.", author: "Ann Lieberman" },
    { text: "The computer was born to solve problems that did not exist before.", author: "Bill Gates" },
    { text: "Every student can learn, just not on the same day, or the same way.", author: "George Evans" },
    { text: "Don't let schooling interfere with your education.", author: "Mark Twain" },
    { text: "Assessment should inspire learning, not just record it.", author: "Edu Thought" },
    { text: "Digital tools are amplifiers — for good teaching they amplify the best aspects.", author: "Education Tech" },
    { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
    { text: "The art of teaching is the art of assisting discovery.", author: "Mark Van Doren" },
    { text: "Technology changes rapidly; learning how to learn will always remain relevant.", author: "Lifelong Learning" },
    { text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.", author: "Malcolm X" },
    { text: "To teach is to learn twice.", author: "Joseph Joubert" },
    { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
    { text: "Students don't care how much you know until they know how much you care.", author: "John C. Maxwell" },
    { text: "The role of a teacher is to create the conditions for invention rather than provide ready-made knowledge.", author: "Seymour Papert" },
    { text: "Learning is the only thing the mind never exhausts, never fears, and never regrets.", author: "Leonardo da Vinci" },
    { text: "The future of education is personalized learning powered by thoughtful technology.", author: "EdTech Vision" },
    { text: "Knowledge grows when shared.", author: "Unknown" },
    { text: "The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.", author: "Marcel Proust" },
    { text: "Problem solving and creativity are the most important skills for the digital age.", author: "Workforce Report" },
    { text: "Learning never stops; it's the most important habit a student can develop.", author: "Author Unknown" },
    { text: "If you are not willing to learn, no one can help you. If you are determined to learn, no one can stop you.", author: "Zig Ziglar" },
    { text: "Technology should give students more powerful ways to think and learn, not just more things to do.", author: "Learning Tech" },
    { text: "Teach the student, not the lesson.", author: "Unknown" },
    { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
    { text: "Education is the movement from darkness to light.", author: "Allan Bloom" },
    { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
    { text: "Every child is an artist. The problem is how to remain an artist once we grow up.", author: "Pablo Picasso" },
    { text: "Adaptability is about the powerful difference between adapting to cope and adapting to win.", author: "Max McKeown" }
  ];

  const NEWS = [
    { title: "AI tutors reduce study time while improving outcomes", source: "EduTech Daily", url: "https://example.com/news/ai-tutors" },
    { title: "Major university launches low-cost online micro-degree", source: "Campus News", url: "https://example.com/news/micro-degree" },
    { title: "Open-source learning platforms gain global traction", source: "OpenEd", url: "https://example.com/news/open-platforms" },
    { title: "New research links spaced repetition to better retention", source: "Learning Science", url: "https://example.com/news/spaced-repetition" },
    { title: "K–12 schools adopt blended learning models post-pandemic", source: "Education Weekly", url: "https://example.com/news/blended-learning" },
    { title: "Coding bootcamps report high placement rates in tech", source: "Tech Careers", url: "https://example.com/news/bootcamps" },
    { title: "VR classrooms make immersive history lessons possible", source: "Immersive Ed", url: "https://example.com/news/vr-classrooms" },
    { title: "Major browser adds privacy features for student data", source: "Privacy Today", url: "https://example.com/news/student-privacy" },
    { title: "Scholarships expand for women in STEM fields", source: "STEM Ahead", url: "https://example.com/news/women-stem" },
    { title: "Mobile-first courses reach learners in remote regions", source: "Global Learning", url: "https://example.com/news/mobile-courses" },
    { title: "University research shows project-based learning boosts engagement", source: "Campus Research", url: "https://example.com/news/project-learning" },
    { title: "Low-code tools help teachers build interactive lessons", source: "EdTech Maker", url: "https://example.com/news/low-code-lessons" },
    { title: "AI-driven grading saves instructors hours per week", source: "Teaching Tools", url: "https://example.com/news/ai-grading" },
    { title: "National curriculum includes digital literacy by default", source: "Policy Brief", url: "https://example.com/news/digital-literacy" },
    { title: "New accessibility standards improve learning for all", source: "Inclusive Ed", url: "https://example.com/news/accessibility" },
    { title: "EdTech startups raise $200M for adaptive learning", source: "Startup Beat", url: "https://example.com/news/adaptive-learning" },
    { title: "Teachers use analytics to spot struggling students early", source: "Analytics in Ed", url: "https://example.com/news/spotting-students" },
    { title: "University partners with industry to update syllabus", source: "IndustryEd", url: "https://example.com/news/industry-partner" },
    { title: "Local library becomes community learning hub", source: "Local News", url: "https://example.com/news/library-hub" },
    { title: "Microcredentials popular among working professionals", source: "Career Pathways", url: "https://example.com/news/microcredentials" },
    { title: "Researchers publish free dataset for education analytics", source: "DataEd", url: "https://example.com/news/dataset" },
    { title: "Hybrid labs let students practice engineering remotely", source: "LabTech", url: "https://example.com/news/hybrid-labs" },
    { title: "AI helps create personalized reading lists for students", source: "ReadingTech", url: "https://example.com/news/personalized-reading" },
    { title: "Blockchain credentials simplify degree verification", source: "Credentials Today", url: "https://example.com/news/blockchain-creds" },
    { title: "Community colleges expand evening tech classes", source: "Local Education", url: "https://example.com/news/evening-classes" },
    { title: "Interactive simulations increase STEM comprehension", source: "STEM Learning", url: "https://example.com/news/simulations" },
    { title: "National contest encourages student entrepreneurs", source: "Campus Events", url: "https://example.com/news/entrepreneur-contest" },
    { title: "Open textbooks reduce costs for millions of students", source: "Open Texts", url: "https://example.com/news/open-textbooks" },
    { title: "AI ethics added to computer science curriculum", source: "CS Ed", url: "https://example.com/news/ai-ethics" },
    { title: "Peer tutoring platforms connect global learners", source: "Peer Learn", url: "https://example.com/news/peer-tutoring" },
    { title: "Schools pilot energy-efficient tech in classrooms", source: "Green Ed", url: "https://example.com/news/green-tech" },
    { title: "Massive open online course sees record enrollment", source: "MOOC Watch", url: "https://example.com/news/mooc-enroll" },
    { title: "Adaptive tests give faster feedback to students", source: "Assessment News", url: "https://example.com/news/adaptive-tests" },
    { title: "New mentorship networks help new teachers succeed", source: "Teacher Support", url: "https://example.com/news/mentorship" },
    { title: "Universities pilot competency-based diplomas", source: "HigherEd", url: "https://example.com/news/competency-diplomas" },
    { title: "Ed research shows hands-on learning improves retention", source: "Research Journal", url: "https://example.com/news/hands-on-learning" },
    { title: "Language learning apps add AI pronunciation coaches", source: "Language Tech", url: "https://example.com/news/pronunciation" },
    { title: "Cybersecurity curriculum expands at high school level", source: "Security Ed", url: "https://example.com/news/cyber-curriculum" },
    { title: "New funding for rural broadband supports remote learning", source: "Infrastructure Daily", url: "https://example.com/news/rural-broadband" },
    { title: "Student makerspaces fuel practical skills and creativity", source: "Maker Journal", url: "https://example.com/news/makerspaces" },
    { title: "Tech internships increase diversity in engineering", source: "Diversity Report", url: "https://example.com/news/internships" },
    { title: "AI and teachers: collaboration, not replacement", source: "EdTech Forum", url: "https://example.com/news/ai-teachers" },
    { title: "New grant funds STEM outreach for underserved youth", source: "Grants & Education", url: "https://example.com/news/stem-grant" },
    { title: "Universities invest in low-carbon campus tech", source: "Sustainable Campus", url: "https://example.com/news/low-carbon" },
    { title: "Research shows short focused study sessions outperform cramming", source: "Study Science", url: "https://example.com/news/focused-study" },
    { title: "AI-assisted labs speed up experimental learning", source: "Lab AI", url: "https://example.com/news/ai-labs" },
    { title: "Career services add portfolio-based evaluation", source: "Career Services", url: "https://example.com/news/portfolio" }
  ];

  function shuffleArray(array) {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getRandomQuote() {
    if (!QUOTES.length) return null;
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }

  function getRandomNews(count = 5) {
    const n = Math.max(0, Math.min(count, NEWS.length));
    return shuffleArray(NEWS).slice(0, n);
  }

  // Expose to window for browser usage
  window.EDU_QUOTES = QUOTES;
  window.EDU_NEWS = NEWS;
  window.getRandomQuote = getRandomQuote;
  window.getRandomNews = getRandomNews;

})(window);
