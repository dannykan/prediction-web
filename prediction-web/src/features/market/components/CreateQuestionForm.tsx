/**
 * Create Question Form Component
 * Multi-step form for creating prediction markets
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { QuestionType, CreationStep, Answer, TierConfig } from "../types/create-question";
import { TIER_CONFIGS } from "../types/create-question";
import { getMe } from "@/features/user/api/getMe";
import { getUserStatistics } from "@/features/user/api/getUserStatistics";
import { getCategoriesClient, type Category } from "../api/getCategoriesClient";
import { uploadMarketImage } from "../api/uploadMarketImage";
import { createMarket, type MarketOption, type FirstBetSelection } from "../api/createMarket";
import type { User } from "@/features/user/types/user";

// Step components (will be created separately)
import { StepIndicator } from "./CreateQuestionSteps/StepIndicator";
import { Step1TypeSelection } from "./CreateQuestionSteps/Step1TypeSelection";
import { Step2BasicInfo } from "./CreateQuestionSteps/Step2BasicInfo";
import { Step3TierSelection } from "./CreateQuestionSteps/Step3TierSelection";
import { Step4Prediction } from "./CreateQuestionSteps/Step4Prediction";
import { Step5Confirm } from "./CreateQuestionSteps/Step5Confirm";

export function CreateQuestionForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CreationStep>("type");
  const [user, setUser] = useState<User | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Step 1: Question Type
  const [questionType, setQuestionType] = useState<QuestionType | null>(null);

  // Step 2: Basic Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([
    { id: 1, text: "" },
    { id: 2, text: "" },
  ]);
  const [nextAnswerId, setNextAnswerId] = useState(3);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Step 3: Tier Selection
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  // Step 4: Prediction
  const [selectedPredictions, setSelectedPredictions] = useState<number[]>([]);

  // Creation state
  const [isCreating, setIsCreating] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [userData, categoriesData] = await Promise.all([
          getMe(),
          getCategoriesClient(), // No cache for categories
        ]);

        if (userData) {
          setUser(userData);
          // Load user balance from statistics
          const stats = await getUserStatistics(userData.id);
          if (stats) {
            setUserBalance(stats.statistics.profitRate.total.coinBalance);
          }
        } else {
          // Redirect to homepage if not authenticated
          router.push("/");
          return;
        }

        setCategories(categoriesData);
      } catch (error) {
        console.error("[CreateQuestionForm] Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const url = await uploadMarketImage(file);
      setUploadedImageUrl(url);
      setImageFile(file);
    } catch (error) {
      console.error("[CreateQuestionForm] Failed to upload image:", error);
      alert("圖片上傳失敗，請重試");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Navigation
  const goToNextStep = () => {
    if (!canProceed) return;

    switch (currentStep) {
      case "type":
        setCurrentStep("basicInfo");
        break;
      case "basicInfo":
        setCurrentStep("tierSelection");
        break;
      case "tierSelection":
        setCurrentStep("prediction");
        break;
      case "prediction":
        setCurrentStep("confirm");
        break;
      case "confirm":
        handleCreate();
        break;
    }
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case "type":
        break;
      case "basicInfo":
        setCurrentStep("type");
        break;
      case "tierSelection":
        setCurrentStep("basicInfo");
        break;
      case "prediction":
        setCurrentStep("tierSelection");
        break;
      case "confirm":
        setCurrentStep("prediction");
        break;
    }
  };

  // Validation
  const canProceed = (() => {
    switch (currentStep) {
      case "type":
        return questionType !== null;
      case "basicInfo":
        return (
          title.trim().length > 0 &&
          selectedCategoryIds.length > 0 &&
          closeDate.length > 0 &&
          (questionType === "binary" || answers.every((a) => a.text.trim().length > 0))
        );
      case "tierSelection":
        return selectedTier !== null;
      case "prediction":
        return selectedPredictions.length > 0;
      case "confirm":
        return true;
    }
  })();

  // Get selected tier config
  const selectedTierConfig: TierConfig | null =
    selectedTier !== null ? TIER_CONFIGS.find((t) => t.value === selectedTier) || null : null;

  // Calculate bet amount (50% of tier value)
  const betAmount = selectedTier ? Math.round(selectedTier * 0.5) : 0;
  const betAmountPerAnswer =
    questionType === "multiple" && selectedPredictions.length > 0
      ? Math.round(betAmount / selectedPredictions.length)
      : betAmount;

  // Handle creation
  const handleCreate = async () => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      if (!user || !questionType || !selectedTier || selectedPredictions.length === 0) {
        throw new Error("請完成所有必填項目");
      }

      // Build options
      let options: MarketOption[] = [];
      if (questionType === "binary") {
        options = [
          { id: "yes", name: "是" },
          { id: "no", name: "否" },
        ];
      } else {
        options = answers.map((answer) => ({
          id: `option_${answer.id}`,
          name: answer.text,
        }));
      }

      // Build first bet selections
      const firstBetSelections: FirstBetSelection[] = [];
      if (questionType === "binary") {
        const selectedId = selectedPredictions[0];
        const selectionId = selectedId === 1 ? "yes" : "no";
        firstBetSelections.push({
          selectionId,
          stakeAmount: betAmount,
          side: selectedId === 1 ? "YES" : "NO",
        });
      } else if (questionType === "single") {
        const answerId = selectedPredictions[0];
        const selectionId = `option_${answerId}`;
        firstBetSelections.push({
          selectionId,
          stakeAmount: betAmount,
          side: "YES",
        });
      } else {
        // Multiple choice: distribute bet amount evenly
        const baseAmount = Math.floor(betAmount / selectedPredictions.length);
        const remainder = betAmount % selectedPredictions.length;
        selectedPredictions.forEach((answerId, index) => {
          const selectionId = `option_${answerId}`;
          firstBetSelections.push({
            selectionId,
            stakeAmount: baseAmount + (index < remainder ? 1 : 0),
            side: "YES",
          });
        });
      }

      // Create market
      const result = await createMarket({
        title: title.trim(),
        description: description.trim() || undefined,
        questionType: questionType === "binary" ? "YES_NO" : questionType === "single" ? "SINGLE_CHOICE" : "MULTIPLE_CHOICE",
        mechanism: "LMSR_V2", // Always use LMSR_V2 mechanism
        options,
        categoryId: selectedCategoryIds[0] || undefined,
        closeTime: new Date(closeDate).toISOString(),
        imageUrl: uploadedImageUrl || undefined,
        rules: {
          questionType: questionType,
        },
        creationFee: Math.round(selectedTier * 0.5),
        firstBetAmount: betAmount,
        firstBetSelections,
        commissionRate: selectedTierConfig ? selectedTierConfig.commissionRate / 100 : undefined,
      });

      // Success! Redirect to market detail page or home
      if (result.market.shortcode) {
        // Use the slug from the backend (preserves Chinese characters)
        const slug = result.market.slug || result.market.title.trim().replace(/\s+/g, "-");
        router.push(`/m/${result.market.shortcode}-${slug}`);
      } else {
        // Fallback to home if no shortcode
        router.push("/home");
      }
    } catch (error) {
      console.error("[CreateQuestionForm] Failed to create market:", error);
      alert(error instanceof Error ? error.message : "創建失敗，請重試");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-600">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const currentStepIndex = ["type", "basicInfo", "tierSelection", "prediction", "confirm"].indexOf(currentStep);

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl border-b border-cyan-500/30 bg-[#0B0E1E]/95">
        <div className="container mx-auto px-3 md:px-4 py-2 md:py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center hover:bg-cyan-500/30 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
              創建題目
            </h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        <StepIndicator currentStep={currentStepIndex} totalSteps={5} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 md:px-4 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto">
          {currentStep === "type" && (
            <Step1TypeSelection
              questionType={questionType}
              onSelectType={setQuestionType}
            />
          )}
          {currentStep === "basicInfo" && (
            <Step2BasicInfo
              title={title}
              onTitleChange={setTitle}
              description={description}
              onDescriptionChange={setDescription}
              closeDate={closeDate}
              onCloseDateChange={setCloseDate}
              categories={categories}
              selectedCategoryIds={selectedCategoryIds}
              onCategoryToggle={(categoryId) => {
                setSelectedCategoryIds((prev) =>
                  prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
                );
              }}
              questionType={questionType}
              answers={answers}
              onAnswersChange={setAnswers}
              nextAnswerId={nextAnswerId}
              onNextAnswerIdChange={setNextAnswerId}
              imageFile={imageFile}
              uploadedImageUrl={uploadedImageUrl}
              isUploadingImage={isUploadingImage}
              onImageUpload={handleImageUpload}
              onImageRemove={() => {
                setImageFile(null);
                setUploadedImageUrl(null);
              }}
            />
          )}
          {currentStep === "tierSelection" && (
            <Step3TierSelection
              tiers={TIER_CONFIGS}
              selectedTier={selectedTier}
              onSelectTier={setSelectedTier}
              userBalance={userBalance}
            />
          )}
          {currentStep === "prediction" && (
            <Step4Prediction
              questionType={questionType}
              answers={answers}
              selectedPredictions={selectedPredictions}
              onSelectPrediction={(id) => {
                if (questionType === "binary" || questionType === "single") {
                  setSelectedPredictions([id]);
                } else {
                  setSelectedPredictions((prev) =>
                    prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
                  );
                }
              }}
              betAmount={betAmount}
              betAmountPerAnswer={betAmountPerAnswer}
            />
          )}
          {currentStep === "confirm" && (
            <Step5Confirm
              questionType={questionType}
              title={title}
              description={description}
              closeDate={closeDate}
              categories={categories}
              selectedCategoryIds={selectedCategoryIds}
              answers={answers}
              selectedTierConfig={selectedTierConfig}
              selectedTier={selectedTier}
              selectedPredictions={selectedPredictions}
              betAmount={betAmount}
              betAmountPerAnswer={betAmountPerAnswer}
              uploadedImageUrl={uploadedImageUrl}
            />
          )}
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0A0E27] via-[#0A0E27]/80 to-transparent pt-6 md:pt-8 pb-20 md:pb-4 border-t border-cyan-500/20 z-40">
        <div className="container mx-auto px-3 md:px-4">
          <div className="max-w-2xl mx-auto flex gap-2 md:gap-3">
            {currentStep !== "type" && (
              <button
                onClick={goToPreviousStep}
                className="flex-1 py-2.5 md:py-3 rounded-lg bg-[#0B0E1E]/70 border border-gray-600/30 text-gray-300 text-sm md:text-base font-bold hover:bg-[#0B0E1E] transition-colors"
              >
                上一步
              </button>
            )}
            <button
              onClick={goToNextStep}
              disabled={!canProceed || isCreating}
              className={`flex-1 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-bold transition-all ${
                canProceed && !isCreating
                  ? currentStep === "confirm"
                    ? "bg-green-500/30 border border-green-500 text-green-400 hover:bg-green-500/40"
                    : "bg-cyan-500/30 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/40"
                  : "bg-[#0B0E1E]/70 border border-gray-600/30 text-gray-600 cursor-not-allowed"
              }`}
            >
              {isCreating ? "創建中..." : currentStep === "confirm" ? "確認創建" : "下一步"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

