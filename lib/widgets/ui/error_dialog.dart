import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cardapio_show/providers/error_provider.dart';

class ErrorDialog extends StatelessWidget {
  const ErrorDialog({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final ErrorProvider errorProvider = Provider.of<ErrorProvider>(context);
    
    if (!errorProvider.isVisible) {
      return const SizedBox.shrink();
    }
    
    final ErrorSeverity severity = errorProvider.severity;
    final Color color = errorProvider.getColorForSeverity(severity);
    final IconData icon = errorProvider.getIconForSeverity(severity);
    
    return Positioned(
      bottom: 16,
      left: 16,
      right: 16,
      child: Material(
        elevation: 4,
        borderRadius: BorderRadius.circular(8),
        color: Colors.white,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: color.withOpacity(0.3)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(8),
                    topRight: Radius.circular(8),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(icon, color: color, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        errorProvider.errorTitle ?? 'Erro',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: color,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 18),
                      onPressed: () => errorProvider.hideError(),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      color: Colors.black54,
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      errorProvider.errorMessage ?? '',
                      style: const TextStyle(fontSize: 14),
                    ),
                    if (errorProvider.retryAction != null) ...[
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton(
                            onPressed: () {
                              errorProvider.hideError();
                              errorProvider.retryAction!();
                            },
                            child: const Text('Tentar novamente'),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
