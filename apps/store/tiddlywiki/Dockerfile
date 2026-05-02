FROM node:20-alpine

RUN apk add --no-cache tini \
    && npm install -g tiddlywiki

VOLUME /wiki
WORKDIR /wiki
EXPOSE 8080

ENTRYPOINT ["tini", "--"]
CMD ["sh", "-c", "if [ ! -f /wiki/tiddlywiki.info ]; then tiddlywiki /wiki --init server; fi && mkdir -p /wiki/tiddlers && printf 'title: $:/config/tiddlyweb/host\\ntype: text/vnd.tiddlywiki\\n\\n$protocol$//$host$/proxy/tiddlywiki/\\n' > /wiki/tiddlers/tiddlyweb-host.tid && exec tiddlywiki +plugins/tiddlywiki/language-de-DE +plugins/tiddlywiki/language-fr-FR +plugins/tiddlywiki/language-es-ES +plugins/tiddlywiki/language-ja-JP +plugins/tiddlywiki/language-ko-KR +plugins/tiddlywiki/language-zh-Hans +plugins/tiddlywiki/language-zh-Hant +plugins/tiddlywiki/language-ru-RU +plugins/tiddlywiki/language-pt-PT +plugins/tiddlywiki/language-it-IT /wiki --listen host=0.0.0.0 port=8080 anon-username=user"]
