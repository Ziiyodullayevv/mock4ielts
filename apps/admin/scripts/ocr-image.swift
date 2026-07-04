import Foundation
import Vision
import AppKit

func recognize(_ path: String) {
  guard let image = NSImage(contentsOfFile: path),
        let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    fputs("NO_IMAGE \(path)\n", stderr)
    return
  }

  let request = VNRecognizeTextRequest { request, _ in
    let observations = (request.results as? [VNRecognizedTextObservation]) ?? []
    let text = observations.compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
    print("\n--- \(URL(fileURLWithPath: path).lastPathComponent) ---")
    print(text)
  }
  request.recognitionLevel = .accurate
  request.usesLanguageCorrection = true
  request.recognitionLanguages = ["en-US"]

  do {
    try VNImageRequestHandler(cgImage: cgImage, options: [:]).perform([request])
  } catch {
    fputs("OCR_ERROR \(path): \(error)\n", stderr)
  }
}

for path in CommandLine.arguments.dropFirst() {
  recognize(path)
}
