import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';

class ColorPickerWithOpacity extends StatefulWidget {
  final Color initialColor;
  final Function(Color) onColorChanged;
  final String label;
  final bool allowTransparent;

  const ColorPickerWithOpacity({
    Key? key,
    required this.initialColor,
    required this.onColorChanged,
    required this.label,
    this.allowTransparent = false,
  }) : super(key: key);

  @override
  _ColorPickerWithOpacityState createState() => _ColorPickerWithOpacityState();
}

class _ColorPickerWithOpacityState extends State<ColorPickerWithOpacity> {
  late Color _currentColor;
  double _opacity = 1.0;
  bool _isTransparent = false;

  @override
  void initState() {
    super.initState();
    _currentColor = widget.initialColor;
    _opacity = widget.initialColor.opacity;
    _isTransparent = widget.initialColor == Colors.transparent;
  }

  void _updateColor(Color color) {
    Color newColor = _isTransparent 
        ? Colors.transparent 
        : color.withOpacity(_opacity);
    
    setState(() {
      _currentColor = newColor;
    });
    
    widget.onColorChanged(newColor);
  }

  void _updateOpacity(double value) {
    setState(() {
      _opacity = value;
      _currentColor = _currentColor.withOpacity(value);
    });
    
    widget.onColorChanged(_currentColor);
  }

  void _toggleTransparent(bool value) {
    setState(() {
      _isTransparent = value;
      if (_isTransparent) {
        _currentColor = Colors.transparent;
      } else {
        // Restore previous color with opacity
        _currentColor = _currentColor.withOpacity(_opacity);
      }
    });
    
    widget.onColorChanged(_currentColor);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            GestureDetector(
              onTap: () => _showColorPicker(context),
              child: Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: _isTransparent ? Colors.transparent : _currentColor,
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                  image: _isTransparent 
                    ? const DecorationImage(
                        image: AssetImage('assets/transparent_background.png'),
                        fit: BoxFit.cover,
                      )
                    : null,
                ),
                child: _isTransparent 
                  ? const Center(child: Text('Transparente'))
                  : null,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (widget.allowTransparent)
                    Row(
                      children: [
                        Checkbox(
                          value: _isTransparent,
                          onChanged: (bool? value) {
                            if (value != null) {
                              _toggleTransparent(value);
                            }
                          },
                        ),
                        const Text('Transparente'),
                      ],
                    ),
                  if (!_isTransparent) ...[
                    const Text('Opacidade:'),
                    Row(
                      children: [
                        Expanded(
                          child: Slider(
                            value: _opacity,
                            min: 0.0,
                            max: 1.0,
                            divisions: 100,
                            onChanged: _updateOpacity,
                          ),
                        ),
                        SizedBox(
                          width: 40,
                          child: Text('${(_opacity * 100).round()}%'),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  void _showColorPicker(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Selecione uma cor'),
          content: SingleChildScrollView(
            child: ColorPicker(
              pickerColor: _isTransparent ? Colors.blue : _currentColor,
              onColorChanged: (Color color) {
                // Only update the picker color, but don't apply yet
                setState(() {
                  if (!_isTransparent) {
                    _currentColor = color.withOpacity(_opacity);
                  }
                });
              },
              pickerAreaHeightPercent: 0.8,
              enableAlpha: false,
              displayThumbColor: true,
              paletteType: PaletteType.hsv,
              pickerAreaBorderRadius: const BorderRadius.all(Radius.circular(10)),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () {
                // Apply the selected color
                if (!_isTransparent) {
                  widget.onColorChanged(_currentColor);
                }
                Navigator.of(context).pop();
              },
              child: const Text('Selecionar'),
            ),
          ],
        );
      },
    );
  }
}
