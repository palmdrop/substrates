npm run build
rm -r ../palmdrop.github.io/substrates
cp -r public ../palmdrop.github.io/substrates

cd ../palmdrop.github.io
git add substrates
git commit -m "Updated Substrates"
git push
