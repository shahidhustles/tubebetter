export enum FeatureFlag {
    TRANSCRIPTION = "transcription",
    IMAGE_GENERATION = "image-generation",
    ANALYSE_VIDEO = "analyse-video",
    TITLE_GENERATIONS = "title-generations",
    SCRIPT_GENERATION = "script-generation",
  }
  
  export const featureFlagEvents: Record<FeatureFlag, { event: string }> = {
    [FeatureFlag.TRANSCRIPTION]: {
      event: "transcribe",
    },
    [FeatureFlag.IMAGE_GENERATION]: {
      event: "generate-image",
    },
    [FeatureFlag.ANALYSE_VIDEO]: {
      event: "analyse-video",
    },
    [FeatureFlag.TITLE_GENERATIONS]: {
      event: "generate-title",
    },
    //this is not handled by event because its a boolean feature
    [FeatureFlag.SCRIPT_GENERATION]: {
      event: "",
    },
  };

//   This is implementing a feature flag system (also called "feature toggles"), 
// which allows you to:

// Enable/disable features without changing code
// Implement A/B testing
// Roll out features gradually
// Control feature access based on user permissions/subscriptions
// Track feature usage via the associated events

// In TypeScript, Record<K, T> is a utility type that creates an object type where:
// K defines the allowed property keys (usually a union of string literals or an enum)
// T defines the type of values those properties can hold