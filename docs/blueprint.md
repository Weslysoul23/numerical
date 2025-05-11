# **App Name**: ApproximateMath

## Core Features:

- Input Forms: Implement UI components for user input of algebraic expressions, methods, initial guesses, and precision. Use number input fields, dropdown menus, and ensure proper input validation.
- Approximation Calculations: Implement the approximation methods for finding the value of e^x (Fixed Point Iteration, Newton-Raphson, Secant) and numerical differentiation (Forward, Backward, Centered Difference). Calculate and display the results in a responsive table format, including relative errors.
- Results Display: Display the iteration tables, approximation results and relative errors clearly, using color-coding (green/red) for error magnitude. Include download button and reset form button.

## Style Guidelines:

- Primary color: White or light grey for a clean background.
- Secondary color: Dark grey or black for text and important elements.
- Accent: Blue (#3498db) for interactive elements and highlights.
- Clear and readable font for all text elements.
- Use simple, professional icons for buttons and interactive elements.
- Clean, well-organized layout with clearly labeled sections and forms.
- Subtle animations or transitions when tables update to provide feedback.

## Original User Request:
Prompt for Website Development (Next.js)
Project Title:
Mathematical Approximation Tools (Built with Next.js)

Project Overview:
We need a user-friendly and accurate Next.js website that offers two main functionalities related to numerical methods and calculus approximations. The design must be clean, professional, and highly usable. No database is required — all operations happen locally in the browser.

Main Features:
1. Finding the Approximate Value of e^x (exponential function)
Methods Available (user can select one):

Fixed Point Iteration

Newton-Raphson Method

Secant Method

User Inputs:

Method of choice (dropdown selection)

Initial guess value (or guesses for secant method)

Number of iterations

Number of decimal places to display (precision)

(Optional) Allow the use of trigonometric functions (sin, cos, tan) and constant e

Outputs:

A dynamic table showing each iteration:

Iteration number

Current approximation

Relative error at each step (in percentage %)

Highlight final result clearly.

Clear formatting and responsive design.

2. Finding the Derivative using Approximation
Approximation Methods (all three results must be shown):

Forward Difference Approximation

Backward Difference Approximation

Centered Difference Approximation

User Inputs:

Algebraic expression (input field, ex: x^2 + 3x + 2)

Guess value (where to compute the derivative)

Value of h (step size)

Number of decimal places to display (precision)

Outputs:

Original derivative value (computed symbolically if possible or shown as N/A if purely numerical)

Approximated derivative using:

Forward method

Backward method

Centered method

Relative error of each approximation compared to the original derivative.

Additional Requirements:
User-Friendly UI/UX:

Clean layout (modern and minimalistic look)

Use responsive tables for results.

Input validation (e.g., prevent invalid inputs like non-numeric guesses)

Color indicators for relative errors (green if small, red if large)

Technical Requirements:

Must use Next.js (latest version preferred, e.g., 14+)

Use Typescript for type safety (optional but preferred)

No backend or database needed; everything must be client-side only.

Use a math library like math.js or implement basic parsing manually for expressions.

Trigonometric functions must be supported in the input expressions.

Optional Enhancements:

Add a "Download Results as CSV" button.

Add "Reset Form" button to clear inputs.

Light/Dark mode toggle.

Design Expectations:
Professional and Clean Design.

Mobile and tablet responsive.

Use simple animations or transitions (e.g., when tables update).

Suggested libraries for UI: Tailwind CSS, Shadcn/ui, or Material-UI.

Clearly labeled sections and forms.

Notes:
Accuracy is critical; approximations must be mathematically sound.

Performance must be smooth even for higher iteration counts (e.g., 100+ iterations).

Allow easy scaling for future expansion (e.g., adding new methods later).
  