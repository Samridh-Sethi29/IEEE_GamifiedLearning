/**
 * Design Coach Evaluation Engine
 * Validates design composition deterministically:
 * 1. Headline Presence & Prominence (Hierarchy)
 * 2. Visual Graphic / Focal Illustration
 * 3. Project-Specific Core Information (Call to action, event details, or safety rule)
 * 4. Canvas Margin / Placement Check
 * Returns pass/fail + exact failure reason + actionable fix hint.
 */

export function evaluateDesign(projectId, elements, canvasBounds = { width: 520, height: 680 }) {
  if (!elements || elements.length === 0) {
    return {
      passed: false,
      failureTitle: "Canvas is Empty!",
      failureReason: "Your design needs content before the Design Coach can review it.",
      hint: "Add a bold Heading at the top and pick a graphic from the left drawer.",
    };
  }

  // 1. Headline Check (Hierarchy)
  const heading = elements.find(
    (e) => e.type === "text" && (e.variant === "heading" || e.fontSize >= 22)
  );
  if (!heading) {
    return {
      passed: false,
      failureTitle: "Missing Main Headline",
      failureReason: "Every great poster starts with an eye-catching headline so the audience instantly understands the topic.",
      hint: "Click '+ Heading' in the Text drawer to add a clear, prominent title at the top of your canvas.",
    };
  }

  // Check headline position (should be in the upper half of the poster)
  if (heading.y > canvasBounds.height * 0.6) {
    return {
      passed: false,
      failureTitle: "Headline is Too Low",
      failureReason: "Headlines create visual hierarchy. When placed at the very bottom, readers might miss the main message.",
      hint: "Move your main headline upward toward the top third of the poster.",
    };
  }

  // 2. Illustration / Sticker Check
  const stickers = elements.filter((e) => e.type === "sticker");
  if (stickers.length === 0) {
    return {
      passed: false,
      failureTitle: "Missing Graphic Illustration",
      failureReason: "Words alone are hard to notice from a distance. A strong visual graphic reinforces your message.",
      hint: "Open the 'Graphics' drawer and place an illustration (like a water drop, heart, or beaker) on the canvas.",
    };
  }

  // 3. Margin & Boundary Check
  const outOfBounds = elements.find(
    (e) => e.x < -20 || e.x + (e.width || 80) > canvasBounds.width + 20 || e.y < -10 || e.y + (e.height || 40) > canvasBounds.height + 20
  );
  if (outOfBounds) {
    return {
      passed: false,
      failureTitle: "Content Outside Canvas Edge",
      failureReason: "Some of your text or graphics are falling off the printable borders of the poster.",
      hint: "Drag elements slightly inward so all important text has comfortable breathing room from the edge.",
    };
  }

  // 4. Project-Specific Requirements
  switch (projectId) {
    case "project-1": {
      // Save Water: needs a call to action
      const hasAction = elements.some(
        (e) => e.type === "badge" || (e.type === "text" && e.variant === "action")
      );
      if (!hasAction) {
        return {
          passed: false,
          failureTitle: "Missing Call to Action",
          failureReason: "Awareness posters must guide the audience on what to do next to make a difference.",
          hint: "Add an Action Badge (e.g., 'Turn off the tap!' or 'Save Every Drop') at the bottom of the poster.",
        };
      }
      return {
        passed: true,
        title: "Awareness Poster Approved! 💧✨",
        summary: "Excellent visual balance! Your bold title grabs attention, the water graphic reinforces the theme, and the action badge gives readers a clear goal.",
      };
    }

    case "project-2": {
      // Kindness Week: needs heart/star/smile + supporting text
      const hasKindSticker = stickers.some((s) => ["heart", "star", "smile"].includes(s.iconKey));
      if (!hasKindSticker) {
        return {
          passed: false,
          failureTitle: "Missing Kindness Graphic",
          failureReason: "A kindness flyer benefits from a warm, friendly symbol like a heart or a smile.",
          hint: "Pick a Heart or Star graphic from the sticker library.",
        };
      }
      const hasSubMessage = elements.some(
        (e) => e.type === "text" && (e.variant === "subtitle" || e.variant === "body")
      );
      if (!hasSubMessage) {
        return {
          passed: false,
          failureTitle: "Missing Kindness Message",
          failureReason: "Add a short uplifting phrase explaining an act of kindness to inspire your classmates.",
          hint: "Click '+ Subtitle' and add a supportive note like 'Share a smile today!'",
        };
      }
      return {
        passed: true,
        title: "Kindness Campaign Mastered! 💖🌟",
        summary: "Warm, inviting, and friendly! The typography hierarchy is clear and the positive message stands out beautifully.",
      };
    }

    case "project-3": {
      // Science Fair: needs date/time/location details
      const hasDetails = elements.some(
        (e) => e.type === "text" && (e.variant === "details" || e.variant === "body")
      );
      if (!hasDetails) {
        return {
          passed: false,
          failureTitle: "Missing Event Details (Date & Place)",
          failureReason: "An invitation cannot guide guests without knowing WHEN and WHERE the science fair is being held.",
          hint: "Click '+ Event Details' to display the date, time, and room/hall location.",
        };
      }
      return {
        passed: true,
        title: "Science Fair Invitation Ready! 🔬🚀",
        summary: "Clear, informative, and organized! Guests can read the event title, admire the science icon, and easily find the date and location.",
      };
    }

    case "project-4": {
      // Stay Safe Online: needs security shield/lock + safety tip
      const hasShield = stickers.some((s) => ["shield", "lock", "computer"].includes(s.iconKey));
      if (!hasShield) {
        return {
          passed: false,
          failureTitle: "Missing Security Symbol",
          failureReason: "Digital safety posters need a recognizable trust icon like a shield or lock.",
          hint: "Place a Safety Shield or Lock from the graphics drawer onto your canvas.",
        };
      }
      const hasTip = elements.some(
        (e) => e.type === "badge" || (e.type === "text" && e.variant === "action")
      );
      if (!hasTip) {
        return {
          passed: false,
          failureTitle: "Missing Golden Safety Rule",
          failureReason: "An infographic should teach at least one concrete safety habit (e.g. 'Keep passwords secret!').",
          hint: "Add an Action/Rule badge highlighting a golden rule for staying safe online.",
        };
      }
      return {
        passed: true,
        title: "Digital Safety Infographic Mastered! 🛡️💻",
        summary: "Outstanding visual communication! The high-contrast shield and clear safety rule empower kids to browse the web safely.",
      };
    }

    default:
      return {
        passed: false,
        failureTitle: "Unknown Project",
        failureReason: "Could not evaluate this project.",
        hint: "Please select a valid design project.",
      };
  }
}
