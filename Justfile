package:
    zip makername-$(git rev-parse --short HEAD).zip -- $(git ls-files)

