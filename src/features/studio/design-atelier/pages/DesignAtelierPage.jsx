import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { PROJECTS } from "../data/projects";
import { evaluateDesign } from "../engine/designCoach";
import CanvaDrawer from "../components/CanvaDrawer";
import CanvaCanvas from "../components/CanvaCanvas";
import CanvaTopToolbar from "../components/CanvaTopToolbar";
import DesignCoachModal from "../components/DesignCoachModal";
import "../designAtelier.css";

export default function DesignAtelierPage() {
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [elements, setElements] = useState([]);
  const [bgColor, setBgColor] = useState("#0f172a");
  const [selectedId, setSelectedId] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);

  // Workflow Controls
  const [isPreview, setIsPreview] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [coachResult, setCoachResult] = useState(null);

  const project = PROJECTS[activeProjectIndex] || PROJECTS[0];
  const scanTimerRef = useRef(null);

  // Clean slate on start
  useEffect(() => {
    setElements([]);
    setBgColor(project.defaultBg || "#0f172a");
    setSelectedId(null);
    setCoachResult(null);
    setIsScanning(false);
    setIsPreview(false);
  }, [project.id]);

  // Add Elements
  const handleAddText = (variant, defaultText, fontSize) => {
    const newEl = {
      id: `text_${Date.now()}`,
      type: "text",
      variant,
      text: defaultText,
      fontSize,
      width: 380,
      x: 50,
      y: variant === "heading" ? 60 : variant === "subtitle" ? 140 : 380,
      scale: 1,
      rotation: 0,
      color: "#ffffff",
      align: "center",
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const handleAddBadge = (text) => {
    const newEl = {
      id: `badge_${Date.now()}`,
      type: "badge",
      text,
      x: 130,
      y: 500,
      scale: 1,
      rotation: 0,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const handleAddSticker = (iconKey, icon, name) => {
    const newEl = {
      id: `sticker_${Date.now()}`,
      type: "sticker",
      iconKey,
      icon,
      name,
      x: 190,
      y: 230,
      scale: 1,
      rotation: 0,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const handleAddShape = (shape, name) => {
    const newEl = {
      id: `shape_${Date.now()}`,
      type: "shape",
      shape,
      name,
      width: shape === "circle" ? 160 : shape === "pill" ? 220 : shape === "divider" ? 320 : 180,
      height: shape === "circle" ? 160 : shape === "pill" ? 60 : shape === "divider" ? 8 : 120,
      x: 140,
      y: 260,
      scale: 1,
      rotation: 0,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const handleUploadImage = (src, name) => {
    if (!uploadedImages.some((img) => img.src === src)) {
      setUploadedImages((prev) => [{ src, name: name || "Upload" }, ...prev]);
    }
    const newEl = {
      id: `image_${Date.now()}`,
      type: "image",
      src,
      name: name || "User Upload",
      width: 200,
      height: 200,
      x: 140,
      y: 200,
      scale: 1,
      rotation: 0,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const handleUpdateElement = (id, updates) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const handleRemoveElement = (id) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleClearCanvas = () => {
    setElements([]);
    setSelectedId(null);
    setCoachResult(null);
    setIsScanning(false);
  };

  // Review / Critique Design
  const handleReviewDesign = () => {
    if (isScanning) return;
    setIsScanning(true);
    setCoachResult(null);

    const result = evaluateDesign(project.id, elements);

    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    scanTimerRef.current = setTimeout(() => {
      setIsScanning(false);
      setCoachResult(result);
    }, 1400);
  };

  const handleNextProject = () => {
    setCoachResult(null);
    setIsScanning(false);
    if (activeProjectIndex < PROJECTS.length - 1) {
      setActiveProjectIndex((cur) => cur + 1);
    }
  };

  const selectedElement = elements.find((e) => e.id === selectedId) || null;

  return (
    <div className="canva-studio-scope" data-testid="canva-studio">
      {/* 1. Atelier Top Navigation Bar */}
      <header className="canva-top-bar">
        <div className="flex items-center gap-4">
          <Link to="/world/studio" className="lab-back-btn">
            <ArrowLeft size={14} />
            <span>Studio Campus</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="canva-brand-badge">Atelier Studio</span>
            <div className="canva-project-pill">
              <span>{project.icon}</span>
              <span>Project {project.number}: {project.title}</span>
            </div>
          </div>
        </div>

        {/* Project Selector Chips */}
        <div className="hidden lg:flex items-center gap-2">
          {PROJECTS.map((p, idx) => (
            <button
              key={p.id}
              className={`canva-tool-btn ${idx === activeProjectIndex ? "active" : ""}`}
              onClick={() => setActiveProjectIndex(idx)}
            >
              <span>{p.icon}</span>
              <span>P{p.number}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            className={`canva-tool-btn ${isPreview ? "active" : ""}`}
            onClick={() => setIsPreview((p) => !p)}
            title="Preview without outlines"
          >
            {isPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{isPreview ? "Exit Preview" : "Preview"}</span>
          </button>

          <button
            className="canva-tool-btn"
            onClick={handleClearCanvas}
            title="Clear Artboard"
          >
            <RotateCcw size={14} />
            <span>Clear</span>
          </button>
        </div>
      </header>

      {/* 2. Atelier Contextual Toolbar (Top Bar for Selected Item: Font Size, Alignment, Color) */}
      <CanvaTopToolbar
        selectedElement={selectedElement}
        onUpdateElement={handleUpdateElement}
        onRemoveElement={handleRemoveElement}
      />

      {/* 3. Main Workspace: Left Navigation + Slide-out Drawer + Centered Artboard */}
      <main className="canva-workspace">
        {/* Left Side Drawer */}
        <CanvaDrawer
          activeProjectId={project.id}
          onAddText={handleAddText}
          onAddBadge={handleAddBadge}
          onAddSticker={handleAddSticker}
          onAddShape={handleAddShape}
          onUploadImage={handleUploadImage}
          uploadedImages={uploadedImages}
          onChangeBg={setBgColor}
          currentBg={bgColor}
        />

        {/* Artboard Stage */}
        <div className="relative flex-1 flex flex-col h-full overflow-hidden">
          {/* Centered Poster Artboard */}
          <CanvaCanvas
            elements={elements}
            bgColor={bgColor}
            selectedId={selectedId}
            isScanning={isScanning}
            isPreview={isPreview}
            onSelect={setSelectedId}
            onUpdateElement={handleUpdateElement}
            onRemoveElement={handleRemoveElement}
          />

          {/* Floating Bottom-Right Design Coach Review Button */}
          <button
            className="canva-coach-floating-btn"
            onClick={handleReviewDesign}
            disabled={isScanning}
            data-testid="coach-review-btn"
          >
            <Sparkles size={16} className={isScanning ? "animate-spin" : ""} />
            <span>{isScanning ? "Scanning Poster..." : "Review with Coach"}</span>
          </button>
        </div>
      </main>

      {/* Design Coach Feedback Modal */}
      {coachResult && (
        <DesignCoachModal
          result={coachResult}
          onClose={() => setCoachResult(null)}
          onNextProject={handleNextProject}
          hasNextProject={activeProjectIndex < PROJECTS.length - 1}
        />
      )}
    </div>
  );
}
