import 'package:flutter/material.dart';

enum ErrorSeverity {
  info,
  warning,
  error,
}

class ErrorAction {
  final String label;
  final VoidCallback onPressed;

  ErrorAction({
    required this.label,
    required this.onPressed,
  });
}

class ErrorData {
  final String title;
  final String message;
  final ErrorSeverity severity;
  final ErrorAction? action;
  final DateTime timestamp;

  ErrorData({
    required this.title,
    required this.message,
    this.severity = ErrorSeverity.error,
    this.action,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();
}

class ErrorProvider extends ChangeNotifier {
  ErrorData? _currentError;
  final List<ErrorData> _errorHistory = [];

  ErrorData? get currentError => _currentError;
  List<ErrorData> get errorHistory => List.unmodifiable(_errorHistory);

  void captureError(dynamic error, {
    String? title,
    String? description,
    ErrorSeverity severity = ErrorSeverity.error,
    ErrorAction? action,
  }) {
    final errorMessage = error is Exception || error is Error
        ? error.toString()
        : error?.toString() ?? 'Erro desconhecido';

    final errorData = ErrorData(
      title: title ?? 'Erro',
      message: description ?? errorMessage,
      severity: severity,
      action: action,
    );

    _currentError = errorData;
    _errorHistory.add(errorData);
    notifyListeners();
  }

  void clearCurrentError() {
    _currentError = null;
    notifyListeners();
  }

  void clearErrorHistory() {
    _errorHistory.clear();
    notifyListeners();
  }
}
