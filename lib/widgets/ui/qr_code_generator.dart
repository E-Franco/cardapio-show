import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'package:screenshot/screenshot.dart';
import 'dart:io';
import 'dart:typed_data';

class QrCodeGenerator extends StatefulWidget {
  final String data;
  final String title;

  const QrCodeGenerator({
    Key? key,
    required this.data,
    required this.title,
  }) : super(key: key);

  @override
  _QrCodeGeneratorState createState() => _QrCodeGeneratorState();
}

class _QrCodeGeneratorState extends State<QrCodeGenerator> {
  final ScreenshotController _screenshotController = ScreenshotController();
  bool _isSaving = false;

  Future<void> _shareQrCode() async {
    setState(() {
      _isSaving = true;
    });

    try {
      final Uint8List? imageBytes = await _screenshotController.capture();
      if (imageBytes == null) {
        throw Exception('Failed to capture QR code image');
      }

      final directory = await getTemporaryDirectory();
      final imagePath = '${directory.path}/qrcode.png';
      final imageFile = File(imagePath);
      await imageFile.writeAsBytes(imageBytes);

      await Share.shareFiles(
        [imagePath],
        text: 'QR Code para ${widget.title}',
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erro ao compartilhar QR code: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          'QR Code para ${widget.title}',
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 20),
        Screenshot(
          controller: _screenshotController,
          child: Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  widget.title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                QrImageView(
                  data: widget.data,
                  version: QrVersions.auto,
                  size: 200,
                  backgroundColor: Colors.white,
                ),
                const SizedBox(height: 8),
                Text(
                  widget.data,
                  style: const TextStyle(fontSize: 12),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton.icon(
              onPressed: _isSaving ? null : _shareQrCode,
              icon: const Icon(Icons.share),
              label: Text(_isSaving ? 'Compartilhando...' : 'Compartilhar'),
            ),
          ],
        ),
      ],
    );
  }
}
