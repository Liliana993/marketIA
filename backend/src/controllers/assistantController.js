import * as assistantService from "../services/assistantService.js";
import * as comboSuggestionService from "../services/comboSuggestionService.js";
import * as dashboardService from "../services/dashboardService.js";
import * as restockAlertService from "../services/restockAlertService.js";
import * as marginAnalysisService from "../services/marginAnalysisService.js";
import * as priceSuggestionService from "../services/priceSuggestionService.js";
import * as weeklyTrendsService from "../services/weeklyTrendsService.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        status: "error",
        message: "El mensaje es requerido",
      });
    }

    const reply = await assistantService.sendMessage(message.trim());
    res.json({ status: "success", reply });
  } catch (error) {
    next(error);
  }
};

export const comboSuggestions = async (req, res, next) => {
  try {
    const suggestions = await comboSuggestionService.suggestCombos();
    res.json({ status: "success", suggestions });
  } catch (error) {
    next(error);
  }
};

export const businessAnalysis = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.json({ status: "success", stats });
  } catch (error) {
    next(error);
  }
};

export const restockAlerts = async (req, res, next) => {
  try {
    const alerts = await restockAlertService.getRestockAlerts();
    res.json({ status: "success", alerts });
  } catch (error) {
    next(error);
  }
};

export const marginAnalysis = async (req, res, next) => {
  try {
    const analysis = await marginAnalysisService.getMarginAnalysis();
    res.json({ status: "success", analysis });
  } catch (error) {
    next(error);
  }
};

export const priceSuggestions = async (req, res, next) => {
  try {
    const suggestions = await priceSuggestionService.getPriceSuggestions();
    res.json({ status: "success", suggestions });
  } catch (error) {
    next(error);
  }
};

export const weeklyTrends = async (req, res, next) => {
  try {
    const trends = await weeklyTrendsService.getWeeklyTrends();
    res.json({ status: "success", trends });
  } catch (error) {
    next(error);
  }
};
