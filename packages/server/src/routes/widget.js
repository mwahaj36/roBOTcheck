function renderWidgetHtml(req, res){
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>roBOTcheck Challenge</title>
    <style>
        body {
            margin: 0;
            padding: 10px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #0d1117;
            color: #c9d1d9;
            text-align: center;
            user-select: none;
            overflow: hidden;
            box-sizing: border-box;
            height: 100%;
        }
        h1 {
            font-size: 14px;
            margin: 0 0 8px 0;
            font-weight: 500;
        }
        p {
            font-size: 12px;
            margin: 4px 0;
            color: #8b949e;
        }
        button {
            background: #238636;
            color: white;
            border: 1px solid rgba(240,246,252,0.1);
            padding: 5px 12px;
            font-size: 12px;
            border-radius: 6px;
            cursor: pointer;
            font-family: inherit;
            transition: background 0.2s;
        }
        button:hover {
            background: #2ea043;
        }
        textarea {
            width: 95%;
            height: 70px;
            background: #161b22;
            color: #c9d1d9;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 6px;
            font-family: inherit;
            font-size: 12px;
            resize: none;
            outline: none;
            box-sizing: border-box;
            margin-bottom: 8px;
        }
        .tile-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-bottom: 8px;
        }
        .tile {
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 10px 6px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .tile.selected {
            background: #1f6feb;
            border-color: #58a6ff;
            color: white;
        }
        .reaction-box {
            width: 95%;
            height: 70px;
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            cursor: pointer;
            margin: 0 auto 8px auto;
            transition: background 0.1s;
        }
        .reaction-box.red {
            background: #da3633;
            border-color: #f85149;
            color: white;
        }
    </style>
</head>
<body>
    <script src="/dist/widget.js"></script>
</body>
</html>
    `)
}

module.exports = { renderWidgetHtml }
