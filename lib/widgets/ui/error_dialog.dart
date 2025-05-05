import 'package:flutter/material.dart';
import 'package:cardapio_show/providers/error_provider.dart';
import 'package:cardapio_show/utils/constants.dart';

class ErrorDialog extends StatelessWidget {
  final ErrorData error;
  final VoidCallback onDismiss;

  const ErrorDialog({
    super.key,
    required this.error,
    required this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Row(
        children: [
          _buildIcon(),
          const SizedBox(width: 8),
          Text(error.title),
        ],
      ),
      content: Text(error.message),
      actions: [
        TextButton(
          onPressed: onDismiss,
          child: const Text('Fechar'),
        ),
        if (error.action != null)
          ElevatedButton(
            onPressed: () {
              onDismiss();
              error.action!.onPressed();
            },
            child: Text(error.action!.label),
          ),
      ],
    );
  }

  Widget _buildIcon() {
    switch (error.severity) {
      case ErrorSeverity.info:
        return const Icon(Icons.info, color: Colors.blue);
      case ErrorSeverity.warning:
        return const Icon(Icons.warning, color: Colors.orange);
      case ErrorSeverity.error:
        return const Icon(Icons.error, color: AppColors.primary);
    }
  }
}
