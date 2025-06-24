import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Card,
  CardHeader,
  CardFooter,
  Spinner,
  Tooltip,
  Toast,
  ToastTitle,
  ToastBody,
} from '@fluentui/react-components';
import { DeleteRegular, InfoRegular } from '@fluentui/react-icons';
import styled from 'styled-components';
import { updateSummary, deleteSummary, Summary } from '../services/summaryService';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  },
  summaryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },
  dialogContent: {
    display: 'flex',
    gap: '16px',
    height: '600px',
  },
  dialogSurface: {
    width: '950px',
    maxWidth: '95vw',
  },
  panel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  rawText: {
    flex: 1,
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '4px',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    position: 'relative',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: tokens.colorNeutralStroke1,
      borderRadius: '4px',
      '&:hover': {
        background: tokens.colorNeutralStroke2,
      },
    },
  },
  summaryText: {
    flex: 1,
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '4px',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: tokens.colorNeutralStroke1,
      borderRadius: '4px',
      '&:hover': {
        background: tokens.colorNeutralStroke2,
      },
    },
  },
  highlighted: {
    backgroundColor: tokens.colorBrandBackground2,
    transition: 'background-color 0.3s ease',
  },
  textHighlight: {
    backgroundColor: '#FFD700',
    color: '#000000',
    transition: 'background-color 0.3s ease',
    borderRadius: '2px',
    padding: '1px 2px',
    animation: 'highlightFade 2s ease-in-out forwards',
    '@keyframes highlightFade': {
      '0%': { backgroundColor: '#FFD700', opacity: '1' },
      '70%': { backgroundColor: '#FFD700', opacity: '1' },
      '100%': { backgroundColor: 'transparent', opacity: '0.3' }
    }
  },
  accordionItem: {
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1,
    },
  },
  accordionHeader: {
    padding: '12px',
    cursor: 'pointer',
    '& > span': {
      backgroundColor: '#1f1f1f',
      borderRadius: '4px',
    },
  },
  accordionPanel: {
    padding: '12px',
  },
});

const StyledTextArea = styled.textarea`
  width: 100%;
  height: 100%;
  padding: 8px;
  border: 1px solid ${tokens.colorNeutralStroke1};
  border-radius: 4px;
  resize: none;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  background-color: ${tokens.colorNeutralBackground1};
  color: ${tokens.colorNeutralForeground1};

  &:focus {
    outline: none;
    border-color: ${tokens.colorBrandStroke1};
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${tokens.colorNeutralStroke1};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${tokens.colorNeutralStroke2};
  }
`;

// Utility functions for text processing
const normalizeText = (text: string): string => {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

const calculateSimilarity = (text1: string, text2: string): number => {
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);
  
  if (normalized1 === normalized2) return 1.0;
  
  const words1 = normalized1.split(' ');
  const words2 = normalized2.split(' ');
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  
  return commonWords.length / totalWords;
};

const findBestMatch = (selectedText: string, rawContent: string): { text: string; index: number; similarity: number } | null => {
  console.log('=== FINDING BEST MATCH ===');
  console.log('Selected text:', `"${selectedText}"`);
  console.log('Raw content length:', rawContent.length);
  
  const sentences = rawContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
  console.log('Found', sentences.length, 'sentences in raw content');
  
  let bestMatch = null;
  let bestSimilarity = 0;
  
  // First, try exact substring matching
  const exactIndex = rawContent.toLowerCase().indexOf(selectedText.toLowerCase());
  if (exactIndex !== -1) {
    console.log('Found exact substring match at index:', exactIndex);
    return {
      text: rawContent.substring(exactIndex, exactIndex + selectedText.length),
      index: exactIndex,
      similarity: 1.0
    };
  }
  
  // Then try sentence-level matching
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    const similarity = calculateSimilarity(selectedText, sentence);
    
    console.log(`Sentence ${i + 1}: "${sentence.substring(0, 50)}..." - similarity: ${similarity.toFixed(3)}`);
    
    if (similarity > bestSimilarity && similarity >= 0.1) { // Lowered threshold
      bestSimilarity = similarity;
      const sentenceStart = rawContent.indexOf(sentence);
      bestMatch = {
        text: sentence,
        index: sentenceStart,
        similarity: similarity
      };
      console.log(`New best match found: "${sentence.substring(0, 50)}..." with similarity ${similarity.toFixed(3)}`);
    }
  }
  
  // Also try word-level matching for shorter selections
  if (selectedText.split(' ').length <= 5) {
    console.log('Trying word-level matching for short selection');
    const words = selectedText.toLowerCase().split(' ').filter(w => w.length > 2);
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      const sentenceWords = sentence.toLowerCase().split(' ').filter(w => w.length > 2);
      
      const matchingWords = words.filter(word => 
        sentenceWords.some(sw => sw.includes(word) || word.includes(sw))
      );
      
      const wordSimilarity = matchingWords.length / Math.max(words.length, 1);
      
      console.log(`Word matching for sentence ${i + 1}: ${matchingWords.length}/${words.length} words match (${wordSimilarity.toFixed(3)})`);
      
      if (wordSimilarity > bestSimilarity && wordSimilarity >= 0.3) {
        bestSimilarity = wordSimilarity;
        const sentenceStart = rawContent.indexOf(sentence);
        bestMatch = {
          text: sentence,
          index: sentenceStart,
          similarity: wordSimilarity
        };
        console.log(`New best word match: "${sentence.substring(0, 50)}..." with word similarity ${wordSimilarity.toFixed(3)}`);
      }
    }
  }
  
  console.log('Final best match:', bestMatch ? `"${bestMatch.text.substring(0, 50)}..." with similarity ${bestMatch.similarity.toFixed(3)}` : 'None');
  return bestMatch;
};

const UXRepository: React.FC = () => {
  const styles = useStyles();
  const [summaries, setSummaries] = useState<Summary[]>([
    {
      id: '1',
      title: 'User Research Interview - John Doe',
      type: 'ux-repository',
      rawContent: `Interview transcript with John Doe about the new feature. John expressed concerns about the current workflow and suggested improvements. The interview lasted 45 minutes and covered various aspects of the user experience.

John began by describing his typical workflow when using the application. He mentioned that he often finds himself switching between multiple tabs and windows to complete simple tasks. "It's like I'm playing a game of hide and seek with the information I need," he said. This observation was particularly interesting because it highlighted a fundamental issue with our information architecture.

When asked about specific pain points, John identified three main areas: navigation complexity, lack of visual feedback, and inconsistent terminology. He explained that the current navigation structure requires too many clicks to reach common functions. "I shouldn't have to remember where everything is hidden," he noted. The lack of visual feedback was another significant concern, especially when performing actions that take time to complete.

John also provided valuable insights about the terminology used throughout the application. He found that some terms were confusing and didn't match his mental model. For example, he was unsure about the difference between "projects" and "workspaces" and often used them interchangeably. This confusion led to errors and frustration.

The most surprising feedback came when John discussed his expectations for the new feature. He emphasized the importance of simplicity and consistency. "I don't need more features," he said, "I need the existing features to work better together." This insight challenged our initial assumptions about what users wanted.

John suggested several specific improvements that could enhance his experience. He recommended adding breadcrumbs for better navigation context, implementing a more robust search function, and creating a unified dashboard that shows all relevant information in one place. He also mentioned that having customizable shortcuts would significantly improve his productivity.

The interview concluded with John expressing optimism about the direction of the product. "I can see that you're thinking about the user experience," he said, "and that gives me confidence that these improvements will make a real difference." His feedback will be invaluable as we continue to refine the feature design.

Key takeaways from this interview include the importance of reducing cognitive load, the value of consistent terminology, and the need for better visual feedback throughout the user journey. These insights will guide our design decisions and help ensure that the new feature addresses real user needs.`,
      summaryContent: 'John identified navigation complexity, lack of visual feedback, and inconsistent terminology as main pain points. He recommended adding breadcrumbs, implementing better search, and creating a unified dashboard. The interview revealed the importance of reducing cognitive load and providing consistent user experience. John emphasized the need for simplicity and consistency, stating that existing features should work better together rather than adding more features. He suggested specific improvements including customizable shortcuts and better information architecture to reduce the need for multiple tabs and windows.',
    },
    {
      id: '2',
      title: 'Usability Testing Results - Mobile App',
      type: 'ux-repository',
      rawContent: `Detailed usability testing session with 5 participants. Key findings: Navigation issues on mobile, 3/5 users struggled with checkout process. Participants ranged from 25-45 years old with varying technical expertise.

The usability testing was conducted over two weeks with participants representing different user segments. Each session lasted approximately 60 minutes and included both guided tasks and free exploration of the mobile application. The testing environment was set up to simulate real-world usage conditions, including various network speeds and device types.

Participant 1 (Sarah, 28, Marketing Professional): Sarah had the most difficulty with the checkout process. She spent over 3 minutes trying to find the "Proceed to Payment" button, which was hidden behind a collapsible section. "I thought I was done when I filled out my shipping information," she said. "I didn't realize there was another step." This revealed a critical information architecture issue.

Participant 2 (Mike, 35, Software Developer): Mike navigated the app quickly but encountered several bugs during the payment process. The app crashed twice when he tried to enter his credit card information. "This is exactly the kind of thing that makes me abandon a purchase," he noted. His technical background allowed him to recover from the crashes, but he expressed concern for less technical users.

Participant 3 (Lisa, 42, Small Business Owner): Lisa struggled with the product search functionality. She tried to filter products by price range but couldn't find the filter options. "I'm used to Amazon's interface," she said, "where the filters are always visible." This comparison highlighted the importance of meeting user expectations based on familiar interfaces.

Participant 4 (David, 31, Graphic Designer): David had the smoothest experience overall but identified several opportunities for improvement. He suggested adding gesture-based navigation and improving the visual hierarchy of product information. "The product images are great, but the text is too small to read comfortably," he observed.

Participant 5 (Emma, 39, Teacher): Emma represented the most challenging user segment, as she described herself as "not very tech-savvy." She struggled with basic navigation and frequently got lost in the app. "I don't know where I am or how to get back," she said multiple times during the session. Her experience highlighted the need for better onboarding and navigation aids.

Common themes emerged across all participants. The checkout process was universally identified as problematic, with users expecting a more streamlined experience. Navigation consistency was another major concern, with users expressing confusion about where to find common functions. The search and filter functionality also received negative feedback, with users finding it difficult to locate and use these features effectively.

Performance issues were noted by three participants, with slow loading times and occasional crashes affecting the overall experience. "I expect apps to be fast and reliable," said Mike. "When they're not, I lose confidence in the brand." This feedback emphasized the importance of technical performance in user experience.

The testing also revealed positive aspects of the current design. All participants praised the visual design and product photography. "The app looks professional and trustworthy," said Lisa. The product detail pages were also well-received, with users appreciating the comprehensive information provided.

Based on these findings, several priority improvements were identified. The checkout process needs immediate attention, with a focus on reducing the number of steps and improving visual clarity. Navigation should be simplified and made more consistent throughout the app. Search and filter functionality should be redesigned to be more discoverable and user-friendly.

The testing results will inform the next iteration of the mobile app design, with specific focus on addressing the pain points identified by users. The goal is to create a more intuitive and efficient experience that reduces friction and increases conversion rates.`,
      summaryContent: 'Navigation issues and checkout process problems were the most common pain points. 3/5 users struggled with checkout, while all participants reported navigation consistency issues. Performance problems affected user confidence. Positive aspects included visual design and product detail pages. Sarah had the most difficulty with the checkout process, spending over 3 minutes trying to find the "Proceed to Payment" button. Mike encountered several bugs during payment that caused app crashes. Lisa struggled with product search functionality and couldn\'t find filter options. David suggested adding gesture-based navigation and improving visual hierarchy. Emma frequently got lost in the app and needed better onboarding.',
    },
    {
      id: '3',
      title: 'Customer Feedback Analysis - Q2 2024',
      type: 'ux-repository',
      rawContent: `Compiled feedback from customer support tickets and surveys. Top pain points: Search functionality (45%), Checkout process (30%), Mobile responsiveness (25%). Analysis based on 500+ customer interactions.

The Q2 2024 customer feedback analysis represents a comprehensive review of user sentiment and pain points across our platform. This analysis was conducted using multiple data sources, including customer support tickets, user surveys, app store reviews, and social media mentions. The data collection period spanned three months, from April through June 2024, ensuring a representative sample of user experiences.

Search functionality emerged as the most significant pain point, with 45% of all feedback mentioning issues related to finding products or information. Users reported that the search results were often irrelevant or incomplete. "I searched for 'wireless headphones' and got results for wired speakers," wrote one customer. This type of feedback was common and indicated a fundamental problem with our search algorithm and result ranking.

The checkout process was the second most mentioned issue, accounting for 30% of all feedback. Users described the process as "confusing," "too long," and "frustrating." Common complaints included hidden fees, unclear shipping options, and difficulty editing order details. One customer wrote, "I had to start over three times because I couldn't figure out how to change my shipping address." This feedback highlighted the need for a more intuitive and flexible checkout experience.

Mobile responsiveness issues represented 25% of the feedback, with users reporting problems across different devices and screen sizes. "The app works great on my iPhone but is completely broken on my Android tablet," was a typical comment. This inconsistency across platforms was particularly concerning given the increasing importance of mobile commerce.

Additional pain points identified in the analysis included account management (15%), product information accuracy (12%), and customer service response times (8%). Users expressed frustration with the account creation and login process, often citing confusing error messages and unclear requirements. Product information accuracy issues ranged from incorrect pricing to missing specifications, leading to purchase decisions based on incomplete information.

The analysis also revealed positive feedback areas that should be maintained and enhanced. Product quality received consistently positive reviews, with 78% of customers expressing satisfaction with their purchases. The visual design of the website and app was also well-received, with users appreciating the clean, modern interface. Customer service representatives were frequently praised for their helpfulness and professionalism.

Demographic analysis showed that feedback patterns varied significantly across user segments. Younger users (18-34) were more likely to report mobile responsiveness issues, while older users (55+) primarily focused on navigation and checkout process problems. This insight suggests the need for age-appropriate design considerations and targeted improvements.

Geographic analysis revealed regional differences in user expectations and pain points. Users in urban areas were more likely to report issues with delivery options and timing, while rural users focused on product availability and shipping costs. International users frequently mentioned language and currency-related issues.

The feedback analysis also identified several emerging trends that could impact future development priorities. Voice search functionality was mentioned positively by early adopters, suggesting an opportunity for competitive advantage. Sustainability and ethical sourcing were increasingly important to users, with many expressing willingness to pay premium prices for responsibly sourced products.

Based on this comprehensive analysis, several strategic recommendations were developed. The search functionality should be prioritized for immediate improvement, with focus on result relevance and user intent understanding. The checkout process should be redesigned with a focus on clarity, flexibility, and error prevention. Mobile responsiveness should be addressed through a comprehensive cross-platform testing and optimization program.

The analysis also recommended implementing a more robust feedback collection system to enable real-time monitoring of user sentiment and faster response to emerging issues. This would include enhanced analytics, automated sentiment analysis, and more frequent user surveys.

The Q2 2024 feedback analysis provides a clear roadmap for improving user experience and addressing the most critical pain points. By focusing on these priority areas, we can significantly enhance customer satisfaction and reduce support costs while building a more competitive and user-friendly platform.`,
      summaryContent: 'Search functionality (45%) and checkout process (30%) were the top pain points. Mobile responsiveness issues affected 25% of users. Product quality received 78% satisfaction ratings. Regional and demographic differences identified, with younger users focusing on mobile issues. Users reported that search results were often irrelevant or incomplete, with one customer searching for "wireless headphones" but getting results for wired speakers. The checkout process was described as confusing, too long, and frustrating with hidden fees and unclear shipping options. Mobile responsiveness problems included inconsistent experiences across devices, with users reporting the app working on iPhone but being broken on Android tablets. Account management issues (15%) included confusing error messages and unclear requirements.',
    },
    {
      id: '4',
      title: 'A/B Testing Results - New Homepage',
      type: 'ux-repository',
      rawContent: `A/B test comparing new homepage design vs current version. New design showed 25% increase in engagement, 15% higher conversion rate. Test ran for 4 weeks with 10,000+ visitors.

The A/B testing for the new homepage design was one of our most comprehensive experiments to date, involving extensive planning, execution, and analysis phases. The test was designed to evaluate the impact of a complete homepage redesign on key performance metrics including engagement, conversion rates, bounce rates, and time on site.

The original homepage (Control Group A) featured a traditional e-commerce layout with a prominent hero banner, category navigation, featured products, and promotional content. The new homepage (Variant B) introduced a more modern, content-driven approach with improved visual hierarchy, enhanced product discovery features, and personalized recommendations.

The testing methodology employed a 50/50 traffic split, ensuring statistical significance with a confidence level of 95%. The test population included both new and returning visitors, with segmentation analysis to understand how different user types responded to the changes. The testing period was carefully chosen to avoid seasonal fluctuations and ensure representative results.

Engagement metrics showed significant improvements across all key indicators. The new homepage achieved a 25% increase in overall engagement, measured by time on site, pages per session, and interaction depth. Users spent an average of 3.2 minutes on the new homepage compared to 2.6 minutes on the original version. This increase was particularly pronounced among new visitors, who showed a 32% improvement in engagement metrics.

Conversion rates improved by 15% overall, with the new homepage converting 3.8% of visitors compared to 3.3% on the original version. This improvement was driven primarily by enhanced product discovery and more effective call-to-action placement. The new design's improved visual hierarchy helped users find relevant products more quickly, reducing the time from landing to purchase.

Bounce rates decreased by 18% on the new homepage, indicating that users were more likely to explore the site after landing. This improvement was attributed to better content relevance and more compelling visual presentation. The personalized recommendation engine, which was a key feature of the new design, played a significant role in reducing bounce rates by providing immediately relevant content.

User behavior analysis revealed interesting patterns in how visitors interacted with the new homepage. The enhanced search functionality received 40% more usage than the original version, suggesting that users found it more discoverable and useful. Product category pages saw increased traffic, with users spending more time exploring different categories before making purchase decisions.

Mobile performance was a particular area of improvement, with mobile users showing even better engagement and conversion improvements than desktop users. The new responsive design and mobile-optimized layout contributed to a 28% increase in mobile conversion rates, compared to 12% on desktop. This finding was especially important given the growing importance of mobile commerce.

The testing also revealed some unexpected insights about user preferences and behavior. Users responded positively to the more content-rich approach, with blog posts and educational content receiving significant engagement. This suggested an opportunity to integrate content marketing more deeply into the homepage experience.

Personalization features showed strong performance, with personalized product recommendations achieving 45% higher click-through rates than generic recommendations. This finding supported the investment in machine learning and user behavior analysis capabilities.

The A/B test also provided valuable insights into user segmentation and targeting. Different user segments responded differently to the new design, with high-value customers showing the most significant improvements in engagement and conversion. This insight informed future personalization strategies and targeting approaches.

Technical performance metrics were also monitored throughout the testing period. The new homepage maintained comparable load times to the original version, ensuring that improved user experience wasn't achieved at the expense of performance. Core Web Vitals scores improved slightly, contributing to better search engine optimization and user experience.

Based on the successful test results, the new homepage design was implemented across the entire platform. The rollout was carefully managed to ensure smooth transition and continued monitoring of performance metrics. Post-implementation analysis confirmed that the improvements were sustained and even enhanced over time.

The A/B testing results provided a strong foundation for future design decisions and established a framework for ongoing optimization. The success of this test encouraged more frequent experimentation and data-driven design decisions throughout the organization.

Key learnings from this A/B test included the importance of user-centered design, the value of comprehensive testing methodologies, and the impact of personalization on user engagement. These insights continue to inform our design and development processes, ensuring that user experience remains a top priority in all future initiatives.`,
      summaryContent: 'New homepage design achieved 25% increase in engagement and 15% higher conversion rate. Mobile users showed 28% conversion improvement vs 12% on desktop. Personalization features achieved 45% higher click-through rates. Content-driven approach with improved visual hierarchy. The new homepage introduced a more modern, content-driven approach with improved visual hierarchy, enhanced product discovery features, and personalized recommendations. Users spent an average of 3.2 minutes on the new homepage compared to 2.6 minutes on the original version. Bounce rates decreased by 18% on the new homepage, indicating users were more likely to explore the site after landing. The enhanced search functionality received 40% more usage than the original version. Mobile performance was particularly strong with mobile users showing better engagement and conversion improvements than desktop users.',
    },
    {
      id: '5',
      title: 'User Journey Mapping Workshop',
      type: 'ux-repository',
      rawContent: `Workshop notes and observations from cross-functional team. Identified 3 critical pain points in user journey, proposed 5 improvement opportunities. Workshop included designers, developers, and product managers.

The User Journey Mapping Workshop was a comprehensive two-day session designed to understand and improve the complete user experience across our platform. The workshop brought together 15 participants from various departments including UX design, product management, development, customer support, and marketing. This cross-functional approach ensured that all perspectives were represented in the analysis and solution development.

The workshop began with a thorough review of existing user research data, including analytics, customer feedback, and usability testing results. This foundation provided context for the journey mapping exercise and helped identify areas requiring deeper investigation. Participants were divided into three teams, each focusing on different user personas and journey stages.

Day one focused on mapping the current user journey across all touchpoints. Teams worked collaboratively to identify every interaction point between users and our platform, from initial awareness through post-purchase support. This comprehensive mapping revealed several previously unidentified friction points and opportunities for improvement.

The journey mapping exercise identified three critical pain points that were affecting user experience and business outcomes. The first pain point was the account creation and onboarding process, which was described as "confusing and unnecessarily complex" by multiple team members. Users often abandoned the process due to unclear requirements and poor error messaging.

The second critical pain point was the product discovery and selection process. Users reported difficulty finding relevant products, comparing options, and understanding product features. The current search and filter functionality was insufficient for complex product categories, leading to user frustration and reduced conversion rates.

The third pain point was the checkout and payment process, which was identified as having too many steps and unclear progress indicators. Users often felt uncertain about their progress through the checkout flow and were concerned about hidden fees or unexpected charges.

In addition to identifying pain points, the workshop also revealed several positive aspects of the current user journey that should be maintained and enhanced. The product detail pages were well-received, with users appreciating the comprehensive information and high-quality imagery. The customer support experience was also positively rated, with users expressing satisfaction with response times and problem resolution.

The workshop participants proposed five key improvement opportunities based on the journey mapping analysis. The first opportunity focused on streamlining the account creation process by reducing required fields, improving error messaging, and offering social login options. This improvement was estimated to reduce abandonment rates by 25-30%.

The second opportunity involved redesigning the product discovery experience with enhanced search functionality, improved filtering options, and better product comparison tools. This improvement was expected to increase product engagement and conversion rates significantly.

The third opportunity centered on optimizing the checkout process by reducing the number of steps, adding progress indicators, and providing clear pricing information throughout the flow. This improvement was projected to increase checkout completion rates by 15-20%.

The fourth opportunity focused on implementing a comprehensive onboarding program for new users, including guided tours, contextual help, and personalized recommendations. This improvement was designed to increase user retention and engagement in the early stages of the customer lifecycle.

The fifth opportunity involved enhancing the post-purchase experience with better order tracking, proactive communication, and simplified return processes. This improvement was aimed at increasing customer satisfaction and encouraging repeat purchases.

The workshop also identified several technical and operational improvements that would support these user experience enhancements. These included implementing better analytics and tracking capabilities, improving the content management system, and enhancing the personalization engine.

Cross-functional collaboration was a key theme throughout the workshop, with participants from different departments sharing insights and perspectives that enriched the analysis. The design team provided expertise on user interface and interaction design, while the development team offered technical feasibility assessments. Product managers contributed business context and prioritization guidance.

The workshop concluded with the development of a comprehensive action plan that prioritized improvements based on user impact, business value, and implementation complexity. Each improvement opportunity was assigned to specific teams with clear timelines and success metrics.

Follow-up activities included detailed design sprints for each improvement opportunity, user testing of proposed solutions, and regular progress reviews to ensure alignment with workshop objectives. The workshop outcomes continue to inform product development decisions and have established a framework for ongoing user experience optimization.

The success of this workshop demonstrated the value of cross-functional collaboration in user experience design and established a model for future journey mapping exercises. The insights gained have been shared across the organization and are being used to guide strategic planning and resource allocation decisions.`,
      summaryContent: 'Three critical pain points identified: account creation complexity, product discovery difficulties, and checkout process issues. Five improvement opportunities focus on streamlining account creation, redesigning product discovery, optimizing checkout, implementing onboarding programs, and enhancing post-purchase experience. The account creation process was described as confusing and unnecessarily complex, with users often abandoning due to unclear requirements and poor error messaging. Product discovery issues included difficulty finding relevant products, comparing options, and understanding product features. The checkout process had too many steps and unclear progress indicators, with users feeling uncertain about their progress and concerned about hidden fees. The workshop involved 15 cross-functional participants from UX design, product management, development, customer support, and marketing.',
    },
    {
      id: '6',
      title: 'Competitive Analysis - E-commerce Platforms',
      type: 'ux-repository',
      rawContent: `Detailed analysis of 5 major competitors in the market. Key differentiators identified: Checkout speed, Mobile UX, Personalization features. Analysis focused on user experience and conversion optimization.

The competitive analysis was conducted over a three-month period, examining five major e-commerce platforms that represent our primary competition in the market. The analysis focused specifically on user experience design, conversion optimization strategies, and technological capabilities that could provide competitive advantages or identify market opportunities.

The five competitors analyzed included Amazon, Shopify-powered stores, WooCommerce sites, custom-built platforms, and emerging direct-to-consumer brands. Each competitor was evaluated across multiple dimensions including user interface design, navigation structure, checkout process, mobile experience, personalization capabilities, and overall conversion optimization strategies.

Amazon emerged as the benchmark for many user experience elements, particularly in search functionality and checkout efficiency. Their one-click ordering process and comprehensive product information set industry standards that users have come to expect. However, the analysis revealed that Amazon's interface complexity and overwhelming product selection could create opportunities for more focused, curated experiences.

Shopify-powered stores showed strong performance in design flexibility and ease of setup, but often lacked the sophisticated personalization and optimization capabilities of larger platforms. The analysis identified opportunities to differentiate through advanced personalization features and superior user experience design that smaller platforms couldn't easily replicate.

WooCommerce sites demonstrated the importance of customization and brand-specific experiences, but often suffered from inconsistent performance and limited mobile optimization. This finding highlighted the opportunity to provide enterprise-level performance and mobile experience while maintaining the customization capabilities that smaller businesses value.

Custom-built platforms showed the highest potential for unique user experiences and brand differentiation, but often lacked the optimization and testing capabilities that drive conversion rates. The analysis suggested that combining custom design with sophisticated optimization tools could create significant competitive advantages.

Direct-to-consumer brands demonstrated the power of focused, brand-specific experiences and strong storytelling. Their success in building emotional connections with customers provided valuable insights into the importance of brand experience in e-commerce.

Key differentiators identified through the analysis included checkout speed, mobile user experience, and personalization features. Checkout speed was particularly important, with faster checkout processes consistently showing higher conversion rates across all analyzed platforms. The analysis revealed that every additional step in the checkout process reduced conversion rates by approximately 5-10%.

Mobile user experience emerged as a critical differentiator, with mobile commerce representing an increasing percentage of total sales across all platforms. The analysis showed that mobile-optimized experiences with touch-friendly interfaces, fast loading times, and simplified navigation significantly outperformed desktop-only or poorly optimized mobile experiences.

Personalization features were identified as a major opportunity for competitive advantage. Platforms that successfully implemented personalized product recommendations, dynamic pricing, and customized user interfaces showed significantly higher engagement and conversion rates. The analysis revealed that personalized experiences could increase conversion rates by 15-25% compared to generic experiences.

The competitive analysis also identified several emerging trends that could impact future market dynamics. Voice commerce was gaining traction, with early adopters showing promising results in specific product categories. Social commerce integration was becoming increasingly important, particularly for younger demographics. Sustainability and ethical sourcing were emerging as important differentiators, with consumers showing willingness to pay premium prices for responsibly sourced products.

Technology capabilities were also analyzed, with particular focus on artificial intelligence, machine learning, and data analytics. Platforms that successfully leveraged these technologies for personalization, inventory management, and customer service showed significant competitive advantages. The analysis revealed that technology investment was directly correlated with user experience quality and business performance.

The competitive analysis also examined pricing strategies, shipping options, and customer service approaches across all platforms. These factors were found to significantly impact user experience and conversion rates, with transparent pricing, fast shipping, and responsive customer service consistently associated with higher customer satisfaction and retention rates.

Based on the comprehensive analysis, several strategic recommendations were developed. The first recommendation focused on optimizing checkout speed and reducing friction in the purchase process. This included implementing one-click ordering options, reducing form fields, and providing clear progress indicators throughout the checkout flow.

The second recommendation emphasized mobile-first design and optimization, recognizing that mobile commerce would continue to grow in importance. This included implementing responsive design principles, optimizing for touch interfaces, and ensuring fast loading times across all devices.

The third recommendation focused on implementing advanced personalization features, including product recommendations, dynamic content, and customized user interfaces. This recommendation was based on the clear correlation between personalization and improved business outcomes.

The fourth recommendation involved investing in technology capabilities, particularly in artificial intelligence and machine learning, to support personalization and optimization efforts. This included implementing recommendation engines, predictive analytics, and automated optimization systems.

The fifth recommendation focused on building strong brand experiences and emotional connections with customers, learning from the success of direct-to-consumer brands. This included developing compelling brand stories, creating engaging content, and building community around the brand.

The competitive analysis provided a comprehensive understanding of the market landscape and identified clear opportunities for differentiation and competitive advantage. The insights gained continue to inform strategic planning and product development decisions, ensuring that our platform remains competitive and continues to deliver superior user experiences.`,
      summaryContent: 'Key differentiators: checkout speed, mobile UX, and personalization features. Checkout speed showed 5-10% conversion impact per additional step. Mobile optimization significantly outperformed desktop-only experiences. Personalization features increased conversion rates by 15-25%. Amazon emerged as the benchmark for search functionality and checkout efficiency with their one-click ordering process. Shopify-powered stores showed strong design flexibility but lacked sophisticated personalization capabilities. WooCommerce sites demonstrated customization importance but suffered from inconsistent performance. Custom-built platforms showed highest potential for unique experiences but lacked optimization capabilities. Direct-to-consumer brands demonstrated the power of focused, brand-specific experiences and strong storytelling. Voice commerce was gaining traction with early adopters showing promising results.',
    }
  ]);
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [highlightedText, setHighlightedText] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [highlightedSentence, setHighlightedSentence] = useState<string>('');
  const rawTextRef = useRef<HTMLDivElement>(null);
  const summaryTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [showNoMatchToast, setShowNoMatchToast] = useState(false);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedTextToProcess, setSelectedTextToProcess] = useState<string>('');

  const handleSummaryClick = (summary: Summary) => {
    console.log('=== OPENING DIALOG ===');
    console.log('Setting selectedSummary:', summary.title);
    console.log('Setting isDialogOpen to true');
    setSelectedSummary(summary);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSummary(null);
    setHighlightedSentence('');
  };

  const handleSaveChanges = async () => {
    if (!selectedSummary) return;
    
    setShowSaveConfirmation(true);
  };

  const confirmSaveChanges = async () => {
    if (!selectedSummary) return;
    
    try {
      setIsSaving(true);
      // Update local state instead of making API call
      const updatedSummary = {
        ...selectedSummary,
        summaryContent: selectedSummary.summaryContent
      };
      setSummaries(summaries.map(summary => 
        summary.id === updatedSummary.id ? updatedSummary : summary
      ));
      setShowSaveConfirmation(false);
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSummaryEdit = (newContent: string) => {
    if (selectedSummary) {
      setSelectedSummary({
        ...selectedSummary,
        summaryContent: newContent
      });
    }
  };

  const handleDeleteSummary = async (id: string) => {
    try {
      await deleteSummary(id);
      setSummaries(summaries.filter(summary => summary.id !== id));
      setHighlightedText('');
    } catch (error) {
      console.error('Failed to delete summary:', error);
    }
  };

  // Enhanced text selection handler with multiple detection methods
  const handleTextSelection = useCallback((e: React.MouseEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement;
    
    // Get the selected text
    const selectedText = textarea.value.substring(
      textarea.selectionStart,
      textarea.selectionEnd
    ).trim();
    
    console.log('=== TEXT SELECTION EVENT ===');
    console.log('Event type:', e.type);
    console.log('Selected text:', `"${selectedText}"`);
    console.log('Selection length:', selectedText.length);
    console.log('Selection range:', textarea.selectionStart, 'to', textarea.selectionEnd);
    console.log('Textarea value length:', textarea.value.length);
    
    // Clear previous timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }
    
    // Process selection with a small delay to ensure dialog state is ready
    if (selectedText.length >= 5) {
      console.log('Processing selection with delay:', selectedText);
      selectionTimeoutRef.current = setTimeout(() => {
        // Call processTextSelection through a ref or state update
        setSelectedTextToProcess(selectedText);
      }, 200); // Increased delay to ensure dialog state is ready
    } else if (selectedText.length > 0) {
      // For shorter selections, use a longer debounce
      selectionTimeoutRef.current = setTimeout(() => {
        console.log('Processing short selection after debounce:', selectedText);
        setSelectedTextToProcess(selectedText);
      }, 300); // Increased delay for shorter selections
    } else {
      console.log('No text selected, clearing highlight');
      setHighlightedSentence('');
    }
  }, []);

  // Alternative selection detection using onSelect event
  const handleSelectEvent = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const selectedText = textarea.value.substring(
      textarea.selectionStart,
      textarea.selectionEnd
    ).trim();
    
    console.log('=== SELECT EVENT ===');
    console.log('Selected text:', `"${selectedText}"`);
    console.log('Selection length:', selectedText.length);
    
    if (selectedText.length >= 5) {
      console.log('Processing selection from select event:', selectedText);
      setSelectedTextToProcess(selectedText);
    } else if (selectedText.length === 0) {
      console.log('No selection, clearing highlight');
      setHighlightedSentence('');
    }
  }, []);

  // Mouse up handler for immediate feedback
  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const selectedText = textarea.value.substring(
      textarea.selectionStart,
      textarea.selectionEnd
    ).trim();
    
    console.log('=== MOUSE UP EVENT ===');
    console.log('Selected text:', `"${selectedText}"`);
    console.log('Selection length:', selectedText.length);
    
    if (selectedText.length >= 5) {
      console.log('Processing selection from mouse up:', selectedText);
      setSelectedTextToProcess(selectedText);
    }
  }, []);

  // Mouse down handler to clear previous highlights
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    console.log('=== MOUSE DOWN EVENT ===');
    console.log('Clearing previous highlight');
    setHighlightedSentence('');
  }, []);

  // Additional handler for mouse events
  const handleMouseEvents = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    // Only process mouse events if there's actually a selection
    const textarea = e.currentTarget;
    const selectedText = textarea.value.substring(
      textarea.selectionStart,
      textarea.selectionEnd
    ).trim();
    
    // Only log and process if there's a meaningful selection
    if (selectedText.length >= 5) {
      console.log('=== MOUSE EVENT WITH SELECTION ===');
      console.log('Event type:', e.type);
      console.log('Selected text on mouse event:', `"${selectedText}"`);
      console.log('Processing selection from mouse event:', selectedText);
      // Note: processTextSelection will be called through other handlers
    }
  }, []);

  // Test handler to verify textarea is working
  const handleTextareaClick = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    console.log('=== TEXTAREA CLICKED ===');
    console.log('Textarea is receiving click events');
    console.log('Textarea value length:', e.currentTarget.value.length);
    console.log('Textarea selection:', e.currentTarget.selectionStart, 'to', e.currentTarget.selectionEnd);
  }, []);

  // Monitor dialog state to ensure textarea is properly initialized
  useEffect(() => {
    if (isDialogOpen && selectedSummary) {
      console.log('=== DIALOG OPENED ===');
      console.log('Dialog is now open, selectedSummary:', selectedSummary.title);
      console.log('Summary content length:', selectedSummary.summaryContent.length);
      
      // Ensure textarea is focused and ready for selection
      setTimeout(() => {
        if (summaryTextareaRef.current) {
          console.log('Textarea ref is available');
          summaryTextareaRef.current.focus();
          
          // Test if we can access the textarea
          console.log('Textarea value:', summaryTextareaRef.current.value.substring(0, 100) + '...');
          console.log('Textarea is ready for interaction');
        } else {
          console.log('Textarea ref is not available');
        }
      }, 100);
    }
  }, [isDialogOpen, selectedSummary]);

  // Process selected text when it changes
  useEffect(() => {
    if (selectedTextToProcess && selectedTextToProcess.length >= 5) {
      console.log('=== PROCESSING SELECTED TEXT FROM STATE ===');
      console.log('Processing:', selectedTextToProcess);
      
      if (!isDialogOpen) {
        console.log('Dialog is not open, skipping processing');
        return;
      }
      
      if (!selectedSummary) {
        console.log('No selectedSummary available, skipping processing');
        return;
      }
      
      console.log('Raw content length:', selectedSummary.rawContent.length);
      console.log('Raw content preview:', selectedSummary.rawContent.substring(0, 200) + '...');
      
      const match = findBestMatch(selectedTextToProcess, selectedSummary.rawContent);
      
      if (match) {
        console.log('=== MATCH FOUND ===');
        console.log('Matched text:', `"${match.text}"`);
        console.log('Similarity score:', match.similarity);
        console.log('Match index:', match.index);
        
        setHighlightedSentence(match.text);
        
        // Scroll to the highlighted text with improved timing and calculation
        setTimeout(() => {
          const rawTextElement = rawTextRef.current;
          if (rawTextElement) {
            console.log('=== SCROLLING TO HIGHLIGHT ===');
            console.log('Raw text element found, calculating scroll position');
            
            // Get the text before the highlight
            const textBeforeHighlight = selectedSummary.rawContent.substring(0, match.index);
            console.log('Text before highlight length:', textBeforeHighlight.length);
            
            // Method 1: Try to find the highlighted element directly
            const highlightedElements = rawTextElement.querySelectorAll(`.${styles.textHighlight}`);
            if (highlightedElements.length > 0) {
              console.log('Found highlighted element, scrolling to it');
              const firstHighlight = highlightedElements[0] as HTMLElement;
              firstHighlight.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              });
              console.log('ScrollIntoView executed');
              return;
            }
            
            // Method 2: Calculate position using temporary element
            console.log('No highlighted element found, calculating position');
            const tempElement = document.createElement('div');
            tempElement.style.cssText = `
              position: absolute;
              top: -9999px;
              left: -9999px;
              width: ${rawTextElement.offsetWidth}px;
              white-space: pre-wrap;
              font-family: inherit;
              font-size: inherit;
              line-height: inherit;
              padding: 16px;
            `;
            tempElement.textContent = textBeforeHighlight;
            document.body.appendChild(tempElement);
            
            const actualHeight = tempElement.offsetHeight;
            document.body.removeChild(tempElement);
            
            console.log('Calculated height before highlight:', actualHeight);
            console.log('Raw text element height:', rawTextElement.offsetHeight);
            
            // Calculate scroll position to center the highlight
            const scrollPosition = Math.max(0, actualHeight - (rawTextElement.offsetHeight / 2));
            console.log('Calculated scroll position:', scrollPosition);
            
            // Smooth scroll to the position
            rawTextElement.scrollTo({
              top: scrollPosition,
              behavior: 'smooth'
            });
            
            console.log('Scroll command executed');
          } else {
            console.log('Raw text element not found for scrolling');
          }
        }, 200); // Increased delay to ensure highlight is fully rendered
      } else {
        console.log('=== NO MATCH FOUND ===');
        console.log('No match found for:', `"${selectedTextToProcess}"`);
        setShowNoMatchToast(true);
        setTimeout(() => setShowNoMatchToast(false), 3000);
      }
      
      // Clear the processed text
      setSelectedTextToProcess('');
    }
  }, [selectedTextToProcess, selectedSummary, isDialogOpen]);

  // Render raw content with highlighted text
  const renderRawContent = useMemo(() => {
    if (!selectedSummary) return '';
    
    if (highlightedSentence) {
      const parts = selectedSummary.rawContent.split(highlightedSentence);
      return parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <span className={styles.textHighlight}>
              {highlightedSentence}
            </span>
          )}
        </React.Fragment>
      ));
    }
    
    return selectedSummary.rawContent;
  }, [selectedSummary, highlightedSentence, styles.textHighlight]);

  return (
    <div className={styles.root}>
      <div className={styles.summaryList}>
        {summaries.map((summary) => {
          const isExpanded = highlightedText === summary.id;
          return (
            <Card
              key={summary.id}
              style={{
                background: tokens.colorNeutralBackground1,
                border: `1px solid ${tokens.colorNeutralStroke1}`,
                borderRadius: '12px',
                boxShadow: 'none',
                transition: 'background 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                marginBottom: isExpanded ? '12px' : '0',
                padding: 0,
                position: 'relative',
              }}
              onClick={() => setHighlightedText(isExpanded ? '' : summary.id)}
            >
              <CardHeader
                header={<Text weight="semibold">{summary.title}</Text>}
                style={{background: tokens.colorNeutralBackground1, margin: 0, padding: '12px', border: 'none'}}
              />
              {isExpanded && (
                <>
                  <Text style={{padding: '0 12px'}}>{summary.summaryContent}</Text>
                  <CardFooter style={{border: 'none', background: tokens.colorNeutralBackground1, margin: 0, padding: '0 12px 12px 12px', display: 'flex', justifyContent: 'space-between'}}>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSummaryClick(summary);
                      }}
                    >
                      Open Dialog
                    </Button>
                    <Button 
                      appearance="subtle" 
                      icon={<DeleteRegular />} 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSummary(summary.id);
                      }}
                      style={{ color: tokens.colorPaletteRedForeground1 }}
                    />
                  </CardFooter>
                </>
              )}
            </Card>
          );
        })}
      </div>

      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(e, data) => {
          // Only allow closing through explicit actions
          if (data.open === false) {
            e.preventDefault();
          }
        }}
      >
        <DialogSurface className={styles.dialogSurface}>
          <DialogBody>
            <DialogTitle>Summary Editor</DialogTitle>
            <DialogContent>
              <div className={styles.dialogContent}>
                <div className={styles.panel}>
                  <Text weight="semibold">Raw Content</Text>
                  <div 
                    ref={rawTextRef}
                    className={styles.rawText}
                  >
                    {renderRawContent}
                  </div>
                </div>
                <div className={styles.panel}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text weight="semibold">Summary</Text>
                    <Tooltip content="Select text in the summary to highlight corresponding content in the Raw Content panel" relationship="label">
                      <InfoRegular style={{ cursor: 'help', color: tokens.colorNeutralForeground2 }} />
                    </Tooltip>
                  </div>
                  <textarea
                    ref={summaryTextareaRef}
                    value={selectedSummary?.summaryContent || ''}
                    onChange={(e) => handleSummaryEdit(e.target.value)}
                    className={styles.summaryText}
                    placeholder="Enter summary..."
                    onMouseUp={handleMouseUp}
                    onKeyUp={handleTextSelection}
                    onSelect={handleSelectEvent}
                    onMouseDown={handleMouseDown}
                    onClick={handleTextareaClick}
                  />
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={handleCloseDialog}>Close</Button>
              <Button 
                appearance="primary" 
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? <Spinner size="tiny" /> : 'Save Changes'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog open={showSaveConfirmation} onOpenChange={(e, data) => {
        if (!data.open) {
          e.preventDefault();
          setShowSaveConfirmation(false);
        }
      }}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Confirm Save Changes</DialogTitle>
            <DialogContent>
              <Text>
                This action will update the summary content in the UX Repository. The changes will be permanently saved and visible to all team members. Are you sure you want to proceed?
              </Text>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setShowSaveConfirmation(false)}>
                Cancel
              </Button>
              <Button 
                appearance="primary" 
                onClick={confirmSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? <Spinner size="tiny" /> : 'Save Changes'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* No Match Found Toast */}
      {showNoMatchToast && (
        <Toast>
          <ToastTitle>No Match Found</ToastTitle>
          <ToastBody>
            No corresponding content found in the raw text. Try selecting a longer phrase or different text.
          </ToastBody>
        </Toast>
      )}
    </div>
  );
};

export default UXRepository; 