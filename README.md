# 🕵️ Conspiracy Theorazine

An educational web application that uses mathematical models to estimate how long conspiracy theories could realistically remain secret.

## 🎯 What It Does

Conspiracy Theorazine helps users think critically about conspiracy theories by calculating the probability that large-scale conspiracies could remain unexposed over time. Using peer-reviewed mathematical models, the app demonstrates that secrets involving many people are extremely difficult to keep.

### Key Features

- **Real-time Calculator**: Input the number of conspirators, their profession type, and how long the conspiracy has allegedly been active to get instant probability calculations
- **Interactive Visualizations**: 
  - Time decay chart showing how secrecy probability decreases over time
  - Probability gauge for visual representation
  - Comparison bars with historical real conspiracies that failed
- **Preset Examples**: Five famous conspiracy theories with estimated parameters (Moon landing, climate change, 9/11, birtherism, Bin Laden)
- **Educational Content**: Detailed explanations of the mathematical models, why secrets fail, and historical examples
- **Mobile-Responsive**: Works seamlessly on desktop, tablet, and mobile devices

## 📐 The Mathematical Models

### Dr. David Robert Grimes' Model

Based on the 2016 paper ["On the Viability of Conspiratorial Beliefs"](https://doi.org/10.1371/journal.pone.0147905) published in PLOS ONE.

**Core Formula:**
```
P(t) = e^(-p × N × t)
```

Where:
- `P(t)` = Probability the conspiracy survives unexposed for time t
- `p` = Probability per year that each conspirator will leak
- `N` = Number of conspirators
- `t` = Time in years

**Profession-Based Leak Rates:**

Dr. Grimes analyzed real conspiracies to determine how often people in different professions leak secrets:

| Profession | Annual Leak Rate |
|------------|------------------|
| Intelligence Workers | 0.0003 (most secretive) |
| Scientists/Researchers | 0.0004 |
| Military Personnel | 0.0004 |
| Government Bureaucrats | 0.0005 |
| Corporate Employees | 0.0006 |
| General Public | 0.001 (least secretive) |

### Key Insights

The model reveals that:
- Secrecy probability decreases **exponentially** with more conspirators
- Even highly trained professionals (intelligence, military) leak secrets within years
- Large conspiracies (1,000+ people) for extended periods (10+ years) are virtually impossible

**Examples:**
- 1,000 people keeping a secret for 5 years: ~13% probability
- 10,000 people for 10 years: < 0.01% probability
- 100,000 people for 20 years: Effectively zero

## 🚀 How to Run Locally

This is a static web application with no backend requirements.

### Option 1: Simple HTTP Server

1. Clone the repository:
```bash
git clone https://github.com/mindfu23/Theorazine.git
cd Theorazine
```

2. Start a local web server (choose one):

**Using Python:**
```bash
python -m http.server 8000
# or for Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js:**
```bash
npx http-server -p 8000
```

**Using PHP:**
```bash
php -S localhost:8000
```

3. Open your browser to `http://localhost:8000`

### Option 2: Direct File Access

Simply open `index.html` in your web browser. Note that some browsers may restrict local file access for security reasons, so using a local server (Option 1) is recommended.

## 📁 File Structure

```
/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # All styling and responsive design
├── js/
│   ├── calculator.js      # Core probability calculations (Grimes' model)
│   ├── presets.js         # Pre-loaded conspiracy examples
│   ├── charts.js          # Visualization logic using Chart.js
│   └── app.js            # Main application logic and event handlers
├── README.md              # This file
└── LICENSE                # MIT License
```

## 🎨 Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)**: Vanilla JavaScript, no frameworks required
- **Chart.js**: Data visualization library for charts

## 📖 Historical Examples

The app includes three real conspiracies that **failed** to stay secret:

1. **Guy Fawkes Gunpowder Plot (1605)**: 14 conspirators, exposed in 1.5 years
2. **Rajneeshee Bioterror Attack (1984)**: 12-19 conspirators, exposed in 1 year
3. **Downing Street Memo (2002)**: 23 conspirators, exposed in 3 years

These examples demonstrate that even small conspiracies with motivated participants get exposed quickly.

## ⚠️ Limitations & Disclaimers

This tool is for **educational purposes** and has important limitations:

- **Probabilistic Model**: Provides statistical estimates, not definitive truths
- **Real-world Factors**: Doesn't account for all variables like compartmentalization, fear, or strong incentives
- **Small Conspiracies**: The model is less accurate for very small groups (< 10 people)
- **Assumes Awareness**: Presumes all conspirators know they're part of a conspiracy

**Critical Thinking**: This tool should be one of many resources used to evaluate extraordinary claims. Always seek evidence, consider alternative explanations, and maintain healthy skepticism.

## 👏 Credits & Attribution

- **Mathematical Model**: [Dr. David Robert Grimes](https://twitter.com/drg1985) - Physicist and cancer researcher
  - Original Paper: ["On the Viability of Conspiratorial Beliefs"](https://doi.org/10.1371/journal.pone.0147905) (PLOS ONE, 2016)
- **Conceptual Inspiration**: James Beach's essay "Conspiracy Theorazine"
- **Implementation**: Open source project by the community

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Areas for improvement:

- Additional historical conspiracy examples
- More visualization options
- Dark mode toggle
- Translations to other languages
- Accessibility improvements

## 📚 Further Reading

- [Dr. Grimes' Original Paper (PLOS ONE)](https://doi.org/10.1371/journal.pone.0147905)
- [BBC Article on the Research](https://www.bbc.com/news/science-environment-35411684)
- [The Guardian: Moon Landing Hoax Theory Would Have Been Exposed Within Four Years](https://www.theguardian.com/science/2016/jan/26/moon-landing-hoax-conspiracy-theory-exposed-four-years)

## 🙋 FAQ

**Q: Does this prove all conspiracy theories are false?**
A: No. It provides a mathematical framework for evaluating the plausibility of large-scale, long-term conspiracies. Small conspiracies can and do remain hidden.

**Q: What about compartmentalization?**
A: Compartmentalization can reduce leak rates, but the model's leak rates are already derived from real conspiracies that used these techniques. The numbers account for typical operational security.

**Q: Doesn't this assume all conspirators want to leak?**
A: No. The leak rate represents accidental slips, deathbed confessions, captured documents, whistleblowers, investigators, and other failure modes - not just intentional leaking.

**Q: What if the government is really good at keeping secrets?**
A: The model's leak rates are based on actual historical conspiracies involving governments and intelligence agencies. The data shows that even well-trained, motivated professionals leak secrets surprisingly often.

---

Made with 🧠 for critical thinking and evidence-based reasoning.
