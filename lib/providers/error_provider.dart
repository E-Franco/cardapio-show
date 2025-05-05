import 'package:flutter/material.dart';

enum ErrorSeverity {
  info,
  warning,
  error,
  success,
}

class ErrorProvider extends ChangeNotifier {
  String? _errorMessage;
  String? _errorTitle;
  ErrorSeverity _severity = ErrorSeverity.error;
  bool _isVisible = false;
  Function? _retryAction;
  
  // Getters
  String? get errorMessage => _errorMessage;
  String? get errorTitle => _errorTitle;
  ErrorSeverity get severity => _severity;
  bool get isVisible => _isVisible;
  Function? get retryAction => _retryAction;
  
  // Mostrar erro
  void showError({
    required String message,
    String? title,
    ErrorSeverity severity = ErrorSeverity.error,
    Function? retryAction,
  }) {
    _errorMessage = message;
    _errorTitle = title ?? _getTitleForSeverity(severity);
    _severity = severity;
    _retryAction = retryAction;
    _isVisible = true;
    notifyListeners();
  }
  
  // Mostrar mensagem de sucesso
  void showSuccess({
    required String message,
    String? title,
  }) {
    showError(
      message: message,
      title: title ?? 'Sucesso',
      severity: ErrorSeverity.success,
    );
  }
  
  // Mostrar mensagem de informação
  void showInfo({
    required String message,
    String? title,
  }) {
    showError(
      message: message,
      title: title ?? 'Informação',
      severity: ErrorSeverity.info,
    );
  }
  
  // Mostrar aviso
  void showWarning({
    required String message,
    String? title,
    Function? retryAction,
  }) {
    showError(
      message: message,
      title: title ?? 'Atenção',
      severity: ErrorSeverity.warning,
      retryAction: retryAction,
    );
  }
  
  // Esconder erro
  void hideError() {
    _isVisible = false;
    notifyListeners();
  }
  
  // Método setError para compatibilidade com código existente
  void setError(String message, {String? title, ErrorSeverity severity = ErrorSeverity.error, Function? retryAction}) {
    showError(
      message: message,
      title: title,
      severity: severity,
      retryAction: retryAction,
    );
  }

  // Capturar erro (para compatibilidade com código existente)
  void captureError(
    dynamic error, {
    String? title,
    String? description,
    ErrorSeverity severity = ErrorSeverity.error,
    ErrorAction? action,
  }) {
    final String errorMessage = description ?? error.toString();
    showError(
      message: errorMessage,
      title: title,
      severity: severity,
      retryAction: action?.onPressed,
    );
  }
  
  // Obter título com base na severidade
  String _getTitleForSeverity(ErrorSeverity severity) {
    switch (severity) {
      case ErrorSeverity.info:
        return 'Informação';
      case ErrorSeverity.warning:
        return 'Atenção';
      case ErrorSeverity.error:
        return 'Erro';
      case ErrorSeverity.success:
        return 'Sucesso';
    }
  }
  
  // Obter cor com base na severidade
  Color getColorForSeverity(ErrorSeverity severity) {
    switch (severity) {
      case ErrorSeverity.info:
        return Colors.blue;
      case ErrorSeverity.warning:
        return Colors.orange;
      case ErrorSeverity.error:
        return Colors.red;
      case ErrorSeverity.success:
        return Colors.green;
    }
  }
  
  // Obter ícone com base na severidade
  IconData getIconForSeverity(ErrorSeverity severity) {
    switch (severity) {
      case ErrorSeverity.info:
        return Icons.info_outline;
      case ErrorSeverity.warning:
        return Icons.warning_amber_outlined;
      case ErrorSeverity.error:
        return Icons.error_outline;
      case ErrorSeverity.success:
        return Icons.check_circle_outline;
    }
  }
}

class ErrorAction {
  final String label;
  final Function onPressed;

  const ErrorAction({
    required this.label,
    required this.onPressed,
  });
}
