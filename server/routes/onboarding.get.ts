interface OnboardingSlide {
  title: string
  text: string
  cta: string
}

export default defineEventHandler(async () => {
  // terrible prompts for onboarding slides on a website: starting with showing the user
  // the logo, telliing them how to browse the site with a mouse,
  // explaining what a recipe is, and so on
  return [
    {
      title: 'Welcome to the Recipe App',
      text: 'We are glad to have you here! You can use the app to find and share recipes with others.',
      cta: 'Get Started',
    },
    {
      title: 'How to Browse',
      text: 'You can browse the app using your mouse or keyboard. Use the navigation bar to explore different sections.',
      cta: 'Learn More',
    },
    {
      title: 'What is a Recipe?',
      text: 'A recipe is a set of instructions for preparing a dish. It usually includes a list of ingredients and steps to follow.',
      cta: 'Explore Recipes',
    },
    {
      title: 'How to Click Buttons',
      text: 'Position your cursor over a button and press down on your mouse or trackpad. The button will respond to your click.',
      cta: 'Try Clicking',
    },
    {
      title: 'Understanding Images',
      text: 'Images are visual elements that show what recipes look like. They help you decide what to cook.',
      cta: 'View Images',
    },
    {
      title: 'What Are Comments?',
      text: 'Comments are thoughts and feedback from other users. You can read them to learn what others think about a recipe.',
      cta: 'See Comments',
    },
    {
      title: 'Using a Search Bar',
      text: 'Type words into the search bar to find specific recipes. Press Enter when you\'re done typing to see results.',
      cta: 'Search Something',
    },
    {
      title: 'Get Started',
      text: 'Click on the "Explore" button to start discovering delicious recipes!',
      cta: 'Explore',
    },
  ] satisfies OnboardingSlide[]
})
