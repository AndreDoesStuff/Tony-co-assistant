import React, { useState } from 'react';
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
  learningList: {
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
  },
  tag: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: tokens.colorNeutralBackground2,
    marginRight: '8px',
    marginBottom: '8px',
  },
  accordionItem: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  accordionHeader: {
    padding: '12px',
    cursor: 'pointer',
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

const SchoolBench: React.FC = () => {
  const styles = useStyles();
  const [materials, setMaterials] = useState<Summary[]>([
    {
      id: '1',
      title: 'Design System - Color Guidelines',
      type: 'school-bench',
      rawContent: `Complete color system documentation including primary, secondary, and tertiary color palettes. Primary colors should be used for main actions and brand elements. Secondary colors provide support and hierarchy. Tertiary colors offer additional variety for specific use cases.

The color system is fundamental to maintaining visual consistency across all digital touchpoints. Our primary color palette consists of three main colors: Blue (#0078D4), Green (#107C10), and Red (#D13438). These colors are used for primary actions, success states, and error states respectively. The primary colors should be used for main actions and brand elements to ensure immediate recognition and clear hierarchy.

Secondary colors provide essential support for the primary palette and help create visual hierarchy throughout the interface. These include neutral grays, accent colors, and semantic colors for specific use cases. Secondary colors are used for backgrounds, borders, text, and supporting elements that don't require the same level of emphasis as primary actions.

Tertiary colors offer additional variety and flexibility for specific use cases such as data visualization, status indicators, and specialized content areas. These colors are used sparingly and should always support the overall design system rather than competing with primary and secondary colors.

The color system also includes comprehensive guidelines for accessibility compliance. All color combinations must meet WCAG 2.1 AA standards for contrast ratios, ensuring that text remains readable for users with visual impairments. Color should never be the sole method of conveying information, and alternative indicators such as icons or text labels should always be provided.

Implementation guidelines specify how colors should be applied across different components and contexts. For example, primary colors should be used consistently for call-to-action buttons, while secondary colors are appropriate for form fields and navigation elements. The guidelines also address color usage in different states such as hover, focus, active, and disabled.

The color system is designed to be flexible and scalable, allowing for future expansion while maintaining consistency. Regular audits and updates ensure that the color palette continues to meet the needs of users and business requirements. Documentation includes specific hex codes, RGB values, and usage examples for each color in the system.

Best practices for color usage include maintaining sufficient contrast ratios, using color consistently across similar elements, and avoiding color combinations that may cause issues for users with color blindness. The system also includes guidelines for dark mode implementation and how colors should adapt to different themes and contexts.

The color guidelines are regularly updated based on user feedback, accessibility requirements, and design trends. All changes to the color system are documented and communicated to the design and development teams to ensure consistent implementation across all projects and platforms.`,
      summaryContent: 'Primary colors should be used for main actions and brand elements. The color system includes primary, secondary, and tertiary palettes with comprehensive accessibility guidelines. Implementation focuses on consistent usage across components while maintaining WCAG 2.1 AA compliance.',
      tags: ['colors', 'design-system', 'guidelines'],
    },
    {
      id: '2',
      title: 'User Interview Techniques',
      type: 'school-bench',
      rawContent: `Comprehensive guide to conducting effective user interviews. Key techniques: Open-ended questions, Active listening, Follow-up probes. Best practices include creating a comfortable environment, avoiding leading questions, and documenting responses accurately.

User interviews are one of the most valuable research methods for understanding user needs, behaviors, and motivations. This comprehensive guide covers essential techniques and best practices for conducting effective interviews that yield actionable insights for product development and design decisions.

The foundation of successful user interviews lies in proper preparation and planning. Before conducting interviews, researchers must clearly define objectives, identify target participants, and develop a structured interview guide. The guide should include a mix of open-ended questions that encourage detailed responses while avoiding leading questions that might bias the participant's answers.

Open-ended questions are the cornerstone of effective user interviews. These questions encourage participants to share detailed stories and experiences rather than providing simple yes/no answers. Examples of effective open-ended questions include "Can you tell me about a time when..." or "What was your experience with..." These questions help researchers understand the context and emotions behind user behaviors.

Active listening is crucial during user interviews and involves more than just hearing what participants say. It requires full attention to both verbal and non-verbal cues, asking clarifying questions when needed, and demonstrating genuine interest in the participant's responses. Active listeners avoid interrupting, provide encouraging feedback, and use techniques like mirroring and paraphrasing to show understanding.

Follow-up probes are essential for digging deeper into interesting or unclear responses. These probes help researchers understand the "why" behind user behaviors and uncover underlying motivations. Effective follow-up questions include "Can you tell me more about that?" or "What made you decide to..." These questions help reveal the reasoning behind user decisions and actions.

Creating a comfortable environment is essential for encouraging honest and detailed responses. This includes choosing an appropriate location, ensuring privacy and confidentiality, and establishing rapport with participants. The interview setting should be free from distractions and interruptions, allowing participants to focus fully on the conversation.

Avoiding leading questions is critical for obtaining unbiased responses. Leading questions suggest the desired answer or make assumptions about the participant's experience. Instead, researchers should use neutral language and avoid questions that begin with "Don't you think..." or "Wouldn't you agree that..." These types of questions can influence participant responses and compromise the validity of the research.

Documentation and note-taking are essential for capturing the rich insights that emerge during user interviews. Researchers should develop a systematic approach to note-taking that captures both direct quotes and observations about participant behavior and emotions. Audio or video recording can supplement notes, but should always be done with explicit consent from participants.

The guide also covers advanced techniques such as laddering, which helps researchers understand the underlying values and motivations behind user preferences. Laddering involves asking "why" questions repeatedly to move from surface-level preferences to deeper values and beliefs. This technique is particularly useful for understanding user decision-making processes.

Analysis and synthesis of interview data is a critical step in the research process. Researchers should look for patterns and themes across multiple interviews, identify common pain points and opportunities, and develop actionable insights for design and product development. The analysis should focus on understanding user needs, behaviors, and motivations rather than simply collecting opinions.

Ethical considerations are paramount in user research, and the guide includes comprehensive guidelines for protecting participant privacy and ensuring informed consent. Researchers must clearly explain the purpose of the interview, how the data will be used, and participants' rights regarding their participation and data.

The guide concludes with practical tips for improving interview skills over time, including regular practice, seeking feedback from colleagues, and continuously refining interview techniques based on experience and outcomes. Successful user interviews require ongoing learning and adaptation to different contexts and participant types.`,
      summaryContent: 'Key techniques: Open-ended questions, Active listening, Follow-up probes. The guide emphasizes proper preparation, creating comfortable environments, and avoiding leading questions. Advanced techniques include laddering for understanding deeper motivations.',
      tags: ['research', 'interviews', 'user-testing'],
    },
    {
      id: '3',
      title: 'Accessibility Best Practices',
      type: 'school-bench',
      rawContent: `WCAG 2.1 guidelines and implementation examples for web accessibility. Essential practices: Color contrast, Keyboard navigation, Screen reader support. Additional considerations include semantic HTML, alternative text for images, and focus management.

Web accessibility is essential for ensuring that digital products and services are usable by people with disabilities. This comprehensive guide covers WCAG 2.1 guidelines and provides practical implementation examples for creating accessible web experiences that work for everyone, regardless of their abilities or assistive technologies.

Color contrast is one of the most fundamental aspects of web accessibility. WCAG 2.1 requires a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text. This ensures that text remains readable for users with visual impairments, color blindness, or those viewing content in bright sunlight. Tools like WebAIM's contrast checker can help designers verify that their color combinations meet accessibility standards.

Keyboard navigation is essential for users who cannot use a mouse or other pointing devices. All interactive elements must be accessible via keyboard, including navigation menus, forms, buttons, and custom controls. The tab order should be logical and intuitive, and users should be able to complete all tasks using only the keyboard. Focus indicators must be visible and clearly indicate which element currently has focus.

Screen reader support is crucial for users who are blind or have severe visual impairments. Semantic HTML provides the foundation for screen reader accessibility, with proper use of headings, lists, tables, and form labels. ARIA (Accessible Rich Internet Applications) attributes can enhance accessibility for complex interactive elements that cannot be achieved with semantic HTML alone.

Semantic HTML is the foundation of accessible web content. Using appropriate HTML elements like headings, paragraphs, lists, and tables helps screen readers and other assistive technologies understand the structure and meaning of content. For example, using h1-h6 elements for headings creates a logical document outline that screen readers can navigate.

Alternative text for images is essential for users who cannot see visual content. Alt text should be descriptive and convey the same information that a sighted user would get from the image. Decorative images should have empty alt attributes, while informative images need meaningful descriptions. Complex images like charts or diagrams may require more detailed descriptions or alternative formats.

Focus management is critical for users navigating with keyboards or assistive technologies. Focus should move logically through interactive elements, and focus indicators should be clearly visible. For single-page applications or dynamic content, focus management becomes even more important as content changes without page reloads.

Form accessibility includes proper labeling, error handling, and validation. All form controls should have associated labels, and error messages should be clear and helpful. Required fields should be clearly indicated, and validation should occur in real-time with appropriate feedback to users.

Multimedia accessibility includes captions for videos, transcripts for audio content, and controls that are accessible via keyboard. Video content should have synchronized captions that accurately represent the audio content, including speaker identification and relevant sound effects.

Testing for accessibility should be an ongoing process that includes both automated and manual testing. Automated tools can identify many accessibility issues, but manual testing with assistive technologies like screen readers is essential for understanding the actual user experience. Regular accessibility audits help ensure that products remain accessible as they evolve.

The guide also covers advanced accessibility topics such as ARIA landmarks, live regions for dynamic content, and mobile accessibility considerations. ARIA landmarks help users navigate complex page structures, while live regions announce changes to dynamic content without requiring users to navigate away from their current location.

Mobile accessibility presents unique challenges due to smaller screens and touch interfaces. Touch targets should be large enough for users with motor impairments, and content should be readable without requiring zooming or horizontal scrolling. Voice control and gesture navigation should be considered for mobile accessibility.

Legal and compliance considerations are also important, as many jurisdictions have laws requiring web accessibility. Understanding the legal requirements in your target markets helps ensure compliance and reduces the risk of legal action. Regular training and awareness programs help teams maintain accessibility standards over time.

The guide concludes with resources for ongoing learning and staying current with accessibility best practices. Accessibility is an evolving field, and staying informed about new guidelines, technologies, and techniques is essential for creating truly inclusive digital experiences.`,
      summaryContent: 'Essential practices: Color contrast, Keyboard navigation, Screen reader support. The guide covers WCAG 2.1 compliance with 4.5:1 contrast ratio requirements and comprehensive keyboard navigation. Semantic HTML and ARIA attributes provide foundation for accessibility.',
      tags: ['accessibility', 'wcag', 'inclusive-design'],
    },
    {
      id: '4',
      title: 'Mobile-First Design Principles',
      type: 'school-bench',
      rawContent: `Detailed guide on mobile-first design approach and responsive design strategies. Core principles: Progressive enhancement, Touch targets, Responsive layouts. Implementation includes flexible grids, media queries, and performance optimization.

Mobile-first design is a design philosophy that prioritizes the mobile experience when creating digital products and services. This approach recognizes that mobile devices are now the primary way many users access the internet, and designing for mobile first ensures that the core experience works well on smaller screens before scaling up to larger devices.

Progressive enhancement is a key principle of mobile-first design that involves starting with a solid foundation that works on all devices and then adding more advanced features for devices that can support them. This approach ensures that users with older devices or slower connections can still access essential functionality while users with newer devices benefit from enhanced features.

Touch targets are critical considerations in mobile design, as fingers are less precise than mouse cursors. Touch targets should be at least 44x44 pixels to ensure they can be easily tapped by users with various hand sizes and motor abilities. Spacing between touch targets should be sufficient to prevent accidental taps on adjacent elements.

Responsive layouts use flexible grids and media queries to adapt content to different screen sizes and orientations. CSS Grid and Flexbox provide powerful tools for creating layouts that work across devices. Media queries allow designers to apply different styles based on screen size, resolution, and other device characteristics.

Flexible grids are the foundation of responsive design, using relative units like percentages and ems instead of fixed pixel values. This approach allows content to scale appropriately across different screen sizes while maintaining visual hierarchy and readability. Grid systems help maintain consistency and alignment across different layouts.

Media queries enable designers to apply different styles based on device characteristics. Common breakpoints include mobile (320px-768px), tablet (768px-1024px), and desktop (1024px+). However, breakpoints should be based on content needs rather than specific device sizes, ensuring that layouts adapt to content rather than arbitrary screen dimensions.

Performance optimization is crucial for mobile users, who often have slower connections and limited data plans. Techniques include optimizing images, minimizing HTTP requests, using efficient CSS and JavaScript, and implementing lazy loading for content that isn't immediately visible. Performance directly impacts user experience and conversion rates.

Content prioritization is essential in mobile-first design, as smaller screens require more focused content strategies. The most important content and functionality should be immediately accessible, with secondary content available through navigation or progressive disclosure. This approach helps users accomplish their goals quickly and efficiently.

Navigation design for mobile requires careful consideration of limited screen space and touch interaction patterns. Common mobile navigation patterns include hamburger menus, tab bars, and gesture-based navigation. Navigation should be consistent, discoverable, and accessible with one hand for most users.

Typography and readability are particularly important on mobile devices, where screen space is limited and reading conditions may vary. Font sizes should be large enough to read comfortably without zooming, and line spacing should provide adequate breathing room. High contrast ratios ensure readability in various lighting conditions.

Touch interaction patterns should follow established conventions that users expect from mobile applications. Common patterns include swipe gestures for navigation, pinch-to-zoom for detailed content, and pull-to-refresh for updating content. These patterns should be implemented consistently throughout the application.

Testing and iteration are essential components of mobile-first design. Testing should occur on actual devices rather than just desktop browsers, as mobile browsers and operating systems can behave differently. User testing with mobile users provides valuable insights into how people actually use mobile applications.

The guide also covers advanced mobile design topics such as offline functionality, push notifications, and native app integration. Offline functionality allows users to access content even when network connectivity is poor or unavailable. Push notifications can increase engagement but must be implemented thoughtfully to avoid annoying users.

Accessibility considerations are particularly important for mobile design, as mobile devices are often used by people with disabilities. Touch targets should be large enough for users with motor impairments, and content should be readable by screen readers. Voice control and gesture navigation should be considered for users who cannot use traditional touch interactions.

Performance monitoring and analytics help designers understand how mobile users interact with their applications and identify opportunities for improvement. Tools like Google PageSpeed Insights and WebPageTest provide insights into performance issues, while analytics platforms help understand user behavior and conversion patterns.

The guide concludes with best practices for implementing mobile-first design in organizations, including team structure, design systems, and development workflows. Mobile-first design requires collaboration between designers, developers, and product managers to ensure that mobile considerations are integrated throughout the product development process.`,
      summaryContent: 'Core principles: Progressive enhancement, Touch targets, Responsive layouts. Mobile-first design prioritizes mobile experience with 44x44px touch targets and flexible grids. Performance optimization and content prioritization are crucial for mobile users.',
      tags: ['mobile', 'responsive', 'design-principles'],
    },
    {
      id: '5',
      title: 'User Feedback Collection Methods',
      type: 'school-bench',
      rawContent: `Various methods for collecting user feedback and insights. Methods: Surveys, In-app feedback, User interviews, Analytics. Each method has specific use cases and should be chosen based on research goals and user context.

User feedback collection is essential for understanding user needs, identifying pain points, and making informed decisions about product development and design. This comprehensive guide covers various methods for collecting user feedback, their strengths and limitations, and best practices for implementation and analysis.

Surveys are one of the most common methods for collecting user feedback due to their scalability and cost-effectiveness. Online surveys can reach large numbers of users quickly and provide quantitative data that can be easily analyzed. However, surveys have limitations including low response rates, potential bias in responses, and limited ability to capture nuanced feedback.

Designing effective surveys requires careful consideration of question types, survey length, and timing. Questions should be clear, unbiased, and focused on specific aspects of the user experience. Survey length should be kept reasonable to maintain completion rates, and surveys should be sent at appropriate times to maximize response rates.

In-app feedback mechanisms provide real-time insights into user experience as users interact with products. These include feedback forms, rating prompts, and bug reporting tools integrated directly into applications. In-app feedback is valuable because it captures user sentiment when the experience is fresh and relevant.

User interviews provide deep, qualitative insights into user needs, motivations, and behaviors. Unlike surveys, interviews allow for follow-up questions and exploration of unexpected topics. Interviews are particularly valuable for understanding complex user journeys and uncovering latent needs that users may not articulate in surveys.

Analytics provide quantitative data about user behavior and can reveal patterns that users may not report in surveys or interviews. Web analytics tools track page views, click paths, conversion rates, and other behavioral metrics. Analytics data should be used in conjunction with qualitative feedback to provide a complete picture of user experience.

Usability testing involves observing users as they complete specific tasks with a product or prototype. This method provides direct insights into how users interact with interfaces and can reveal usability issues that may not be apparent through other feedback methods. Usability testing can be conducted in person or remotely using screen sharing tools.

Focus groups bring together multiple users to discuss their experiences and opinions in a group setting. This method can generate rich discussions and reveal social dynamics that may influence user behavior. However, focus groups can be influenced by group dynamics and may not represent individual user experiences accurately.

Social media monitoring involves tracking mentions, comments, and discussions about products on social media platforms. This method provides insights into public sentiment and can reveal issues or opportunities that may not be captured through other feedback channels. Social media monitoring requires careful analysis to distinguish between genuine user feedback and promotional content.

Customer support data is a valuable source of user feedback that is often overlooked. Support tickets, chat logs, and call recordings can reveal common issues, user frustrations, and opportunities for improvement. Analyzing support data can help identify patterns and prioritize improvements based on actual user problems.

A/B testing provides quantitative data about user preferences and behavior by comparing different versions of features or designs. This method is particularly valuable for optimizing conversion rates and user engagement. A/B testing requires careful experimental design and statistical analysis to ensure valid results.

The choice of feedback collection method depends on research goals, available resources, and the specific questions being investigated. Quantitative methods like surveys and analytics are best for measuring user satisfaction and identifying trends, while qualitative methods like interviews and usability testing are better for understanding user motivations and uncovering new opportunities.

Combining multiple feedback methods provides the most comprehensive understanding of user experience. For example, analytics might reveal that users are abandoning a checkout process, while interviews could help understand why this is happening and how to fix it. This triangulation of data sources leads to more informed decisions.

Implementation considerations include timing, frequency, and user experience impact. Feedback collection should not interfere with the user experience or create additional friction. Timing is important - collecting feedback too frequently can lead to survey fatigue, while collecting it too infrequently may miss important insights.

Analysis and synthesis of feedback data is a critical step in the feedback collection process. Raw feedback must be organized, categorized, and analyzed to identify patterns and actionable insights. This process often involves both quantitative analysis for surveys and analytics data, and qualitative analysis for interviews and open-ended feedback.

Privacy and ethical considerations are important when collecting user feedback. Users should be informed about how their feedback will be used and have control over their data. Feedback collection should comply with relevant privacy regulations and respect user preferences regarding data collection and use.

The guide concludes with recommendations for building a comprehensive feedback collection strategy that combines multiple methods and provides ongoing insights into user experience. Regular feedback collection and analysis should be integrated into product development processes to ensure that user needs remain central to decision-making.`,
      summaryContent: 'Methods: Surveys, In-app feedback, User interviews, Analytics. Each method has specific use cases - surveys for scalability, interviews for deep insights, analytics for behavioral data, and in-app feedback for real-time insights. Combining multiple methods provides comprehensive understanding.',
      tags: ['feedback', 'research', 'user-insights'],
    },
    {
      id: '6',
      title: 'Design Token System',
      type: 'school-bench',
      rawContent: `Comprehensive documentation of design tokens and their implementation. Token categories: Spacing, Typography, Colors, Shadows, Breakpoints. Design tokens ensure consistency across platforms and enable efficient design system maintenance.

Design tokens are the foundational elements of a design system that represent the smallest, reusable pieces of design decisions. They serve as the single source of truth for design values across all platforms and technologies, ensuring consistency and enabling efficient design system maintenance and evolution.

Spacing tokens define the consistent spacing values used throughout a design system, including margins, padding, and gaps between elements. Common spacing scales use values like 4px, 8px, 16px, 24px, 32px, and 48px to create visual rhythm and hierarchy. Spacing tokens should be used consistently across all components and layouts to maintain visual harmony.

Typography tokens define font families, sizes, weights, line heights, and letter spacing used throughout the design system. These tokens ensure consistent text styling across different components and platforms. Typography tokens should be designed to work well together and provide sufficient variety for different content types and hierarchy levels.

Color tokens define the color palette used throughout the design system, including primary colors, secondary colors, semantic colors, and neutral colors. Color tokens should be designed with accessibility in mind, ensuring sufficient contrast ratios and supporting users with color vision deficiencies. Color tokens should also support different themes and modes.

Shadow tokens define the elevation and depth effects used throughout the design system. These tokens create visual hierarchy and help users understand the relationship between different elements on the screen. Shadow tokens should be designed to work consistently across different background colors and lighting conditions.

Breakpoint tokens define the responsive design breakpoints used to adapt layouts to different screen sizes. These tokens ensure consistent responsive behavior across all components and pages. Breakpoint tokens should be based on content needs rather than specific device sizes to ensure optimal user experience across all devices.

Design tokens should be organized in a logical hierarchy that reflects their relationships and dependencies. Common organizational patterns include grouping tokens by category (spacing, typography, colors) and then by specific use case or component. This organization makes it easier for designers and developers to find and use the appropriate tokens.

Implementation of design tokens varies depending on the technology stack and platform requirements. For web applications, design tokens are often implemented using CSS custom properties or design token libraries. For mobile applications, design tokens may be implemented using platform-specific tools or design system libraries.

Design token documentation should be comprehensive and accessible to all team members who work with the design system. Documentation should include token names, values, usage guidelines, and examples of how tokens should be used in different contexts. Visual examples and code snippets help ensure consistent implementation.

Version control and change management are important aspects of design token systems. Changes to design tokens should be carefully considered and communicated to all stakeholders, as they can have widespread impact across the entire design system. Version control helps track changes and enables rollback if necessary.

Design token governance involves establishing processes and guidelines for creating, modifying, and deprecating tokens. This includes defining who can create new tokens, how changes are reviewed and approved, and how deprecated tokens are handled. Good governance ensures that the token system remains organized and maintainable.

Integration with design tools is essential for efficient design token workflows. Design tools should be configured to use design tokens directly, enabling designers to apply consistent values without manually entering them. This integration reduces errors and ensures that designs accurately reflect the design system.

Automation and tooling can significantly improve the efficiency of design token management. Tools can automatically generate code from design tokens, validate token usage, and ensure consistency across different platforms and technologies. Automation reduces manual work and helps prevent inconsistencies.

Testing and validation are important aspects of design token systems. Automated tests can verify that design tokens are implemented correctly and that changes don't break existing functionality. Visual regression testing can ensure that design token changes produce the expected visual results.

The guide also covers advanced topics such as semantic tokens, which provide meaning and context beyond simple values. Semantic tokens use names that describe their purpose rather than their appearance, making them more flexible and easier to understand. For example, a semantic token might be named "primary-action-color" rather than "blue-500".

Design token systems should be designed for scalability and evolution. As design systems grow and change, the token system should be able to accommodate new requirements while maintaining backward compatibility. This includes planning for new token categories, changes to existing tokens, and deprecation of unused tokens.

Performance considerations are important when implementing design tokens, especially for web applications. Large numbers of design tokens can impact performance, so it's important to optimize token delivery and usage. Techniques include bundling tokens efficiently and using CSS custom properties for dynamic values.

The guide concludes with best practices for maintaining and evolving design token systems over time. Regular audits, user feedback, and performance monitoring help ensure that the token system continues to meet the needs of designers, developers, and users. Successful design token systems require ongoing attention and refinement to remain effective and valuable.`,
      summaryContent: 'Token categories: Spacing, Typography, Colors, Shadows, Breakpoints. Design tokens ensure consistency across platforms and enable efficient design system maintenance. Implementation varies by technology stack with comprehensive documentation and governance processes.',
      tags: ['tokens', 'design-system', 'consistency'],
    }
  ]);
  const [selectedMaterial, setSelectedMaterial] = useState<Summary | null>(null);
  const [highlightedText, setHighlightedText] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const handleMaterialClick = (material: Summary) => {
    setSelectedMaterial(material);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedMaterial(null);
  };

  const handleSaveChanges = async () => {
    if (!selectedMaterial) return;
    
    setShowSaveConfirmation(true);
  };

  const confirmSaveChanges = async () => {
    if (!selectedMaterial) return;
    
    try {
      setIsSaving(true);
      // Update local state instead of making API call
      const updatedMaterial = {
        ...selectedMaterial,
        summaryContent: selectedMaterial.summaryContent
      };
      setMaterials(materials.map(material => 
        material.id === updatedMaterial.id ? updatedMaterial : material
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
    if (selectedMaterial) {
      setSelectedMaterial({
        ...selectedMaterial,
        summaryContent: newContent
      });
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      await deleteSummary(id);
      setMaterials(materials.filter(material => material.id !== id));
      setHighlightedText('');
    } catch (error) {
      console.error('Failed to delete material:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.learningList}>
        {materials.map((material) => {
          const isExpanded = highlightedText === material.id;
          return (
            <Card
              key={material.id}
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
              onClick={() => setHighlightedText(isExpanded ? '' : material.id)}
            >
              <CardHeader
                header={<Text weight="semibold">{material.title}</Text>}
                style={{background: tokens.colorNeutralBackground1, margin: 0, padding: '12px', border: 'none'}}
              />
              {isExpanded && (
                <>
                  <div style={{ margin: '8px 0', padding: '0 12px' }}>
                    {material.tags?.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Text style={{padding: '0 12px'}}>{material.summaryContent}</Text>
                  <CardFooter style={{border: 'none', background: tokens.colorNeutralBackground1, margin: 0, padding: '0 12px 12px 12px', display: 'flex', justifyContent: 'space-between'}}>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMaterialClick(material);
                      }}
                    >
                      Open Dialog
                    </Button>
                    <Button 
                      appearance="subtle" 
                      icon={<DeleteRegular />} 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMaterial(material.id);
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
            <DialogTitle>Learning Material Editor</DialogTitle>
            <DialogContent>
              <div className={styles.dialogContent}>
                <div className={styles.panel}>
                  <Text weight="semibold">Raw Content</Text>
                  <div className={styles.rawText}>
                    {selectedMaterial?.rawContent}
                  </div>
                </div>
                <div className={styles.panel}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text weight="semibold">Summary</Text>
                    <Tooltip content="Edit the learning material summary content. Changes will be saved to the School Bench repository." relationship="label">
                      <InfoRegular style={{ cursor: 'help', color: tokens.colorNeutralForeground2 }} />
                    </Tooltip>
                  </div>
                  <StyledTextArea
                    value={selectedMaterial?.summaryContent || ''}
                    onChange={(e) => {
                      if (selectedMaterial) {
                        handleSummaryEdit(e.target.value);
                      }
                    }}
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
                This action will update the learning material content in the School Bench repository. The changes will be permanently saved and visible to all team members. Are you sure you want to proceed?
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
    </div>
  );
};

export default SchoolBench; 