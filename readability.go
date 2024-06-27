package main

import (
	"fmt"
	"net/url"
	"strings"
	"syscall/js"

	readability "github.com/go-shiori/go-readability"
)

func readabilityTextContent(this js.Value, args []js.Value) any {
	body := args[0].String()
	uri := args[1].String()
	reader := strings.NewReader(body)
	parsedUrl, err := url.Parse(uri)
	if err != nil {
		return map[string]any{"error": fmt.Sprintf("failed to parse url %s, %v", uri, err)}
	}
	article, err := readability.FromReader(
		reader, parsedUrl,
	)
	if err != nil {
		return map[string]any{"error": fmt.Sprintf("failed to parse html %s, %v", uri, err), "content": nil}
	}
	return map[string]any{"content": article.TextContent, "error": nil}
}

func main() {
	js.Global().Set("readabilityTextContent", js.FuncOf(readabilityTextContent))
	select {} // keep running
}
