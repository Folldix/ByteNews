from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.enums import ArticleStatus, BlockType, UserRole
from app.models.user import User
from app.models.feed import Category, Tag, ArticleTag, FlashNews
from app.models.article import Article, ArticleBlock
from app.models.community import Poll, PollOption
from app.auth.security import hash_password

def seed():
    with SessionLocal() as db:
        # 1. Author and Reader users
        author = db.scalar(select(User).where(User.email == "alex@bytenews.ua"))
        if not author:
            author = User(
                email="alex@bytenews.ua",
                password_hash=hash_password("password123"),
                full_name="Олександр Коваленко",
                handle="alex_kovalenko",
                role=UserRole.REPORTER,
                role_title="Провідний IT-репортер & Head of AI",
                bio="Досліджую штучний інтелект, LLM-архітектури та хмарні технології для ByteNews.",
                avatar_url="/avatars/Avatar_6.png",
                location="Київ, Україна",
                reporter_topics=["ai", "development"],
            )
            db.add(author)
            db.flush()
            print("Created demo author:", author.email)

        reader = db.scalar(select(User).where(User.email == "reader@bytenews.ua"))
        if not reader:
            reader = User(
                email="reader@bytenews.ua",
                password_hash=hash_password("password123"),
                full_name="Олексій Мельник",
                handle="tech_reader",
                role=UserRole.READER,
                role_title="Читач спільноти",
                bio="Тут я скоро розкажу про себе...",
                avatar_url="/avatars/Avatar_6.png",
                location="Україна",
            )
            db.add(reader)
            db.flush()
            print("Created demo reader:", reader.email)

        # Categories
        cat_map = {c.slug: c for c in db.scalars(select(Category)).all()}
        tag_map = {t.slug: t for t in db.scalars(select(Tag)).all()}

        # 2. Articles
        existing_count = db.scalar(select(Article.id).limit(1))
        if not existing_count:
            now = datetime.now(timezone.utc)
            articles_data = [
                {
                    "title": "Anthropic представила Claude 3.7 Sonnet: гібридне мислення та новий еталон кодингу",
                    "slug": "anthropic-claude-3-7-sonnet-hybrid-reasoning-benchmark",
                    "lead": "Перша на ринку модель із можливістю динамічно регулювати час 'роздумів' (thinking tokens) у реальному часі. Детальний аналіз архітектури та результати бенчмарків SWE-bench.",
                    "category": cat_map.get("ai"),
                    "cover_image_url": "/images/card-m-1.png",
                    "is_hero": True,
                    "read_time_min": 6,
                    "views_count": 8420,
                    "likes_count": 612,
                    "comments_count": 48,
                    "published_at": now - timedelta(minutes=30),
                    "tags": ["claude", "openai"],
                    "blocks": [
                        (BlockType.HEADING, {"text": "Революція гібридного мислення", "level": 2}),
                        (BlockType.TEXT, {"text": "Компанія Anthropic офіційно випустила Claude 3.7 Sonnet — першу у світі модель, яка поєднує миттєву швидкість стандартних LLM із поглибленим покроковим ланцюжком міркувань (extended thinking)."}),
                        (BlockType.QUOTE, {"text": "Це найбільший стрибок у кодогенерації з часів релізу перших версій Claude 3.5 Sonnet.", "author": "Даріо Амодей, CEO Anthropic"}),
                        (BlockType.CODE, {"code": "client = anthropic.Anthropic()\nresponse = client.messages.create(\n    model='claude-3-7-sonnet-20250219',\n    max_tokens=2048,\n    thinking={'type': 'enabled', 'budget_tokens': 1024},\n    messages=[{'role': 'user', 'content': 'Аналіз конкуренції'}]\n)", "language": "python"}),
                    ]
                },
                {
                    "title": "Критична вразливість у ядрі Linux (CVSS 9.8): аналіз механізму експлуатації RCU",
                    "slug": "critical-vulnerability-linux-kernel-rcu-exploit",
                    "lead": "Дослідники з кібербезпеки оприлюднили детальне дослідження Use-After-Free вразливості, яка дозволяє непривілейованому локальному користувачу отримати права root у ядрі.",
                    "category": cat_map.get("cybersecurity"),
                    "cover_image_url": "/images/card-m-2.png",
                    "is_hero": False,
                    "read_time_min": 4,
                    "views_count": 5420,
                    "likes_count": 419,
                    "comments_count": 62,
                    "published_at": now - timedelta(hours=3),
                    "tags": ["linux", "zeroday"],
                    "blocks": [
                        (BlockType.HEADING, {"text": "Механізм експлуатації підсистеми RCU", "level": 2}),
                        (BlockType.TEXT, {"text": "Вразливість криється в обробці станів блокування пам'яті Read-Copy-Update ядра Linux."}),
                    ]
                },
                {
                    "title": "React 19 вийшов у стабільний реліз: server actions, useActionState та кінець епохи forwardRef",
                    "slug": "react-19-stable-release-server-components-compiler",
                    "lead": "Команда Meta опублікувала фінальну версію React 19. Головні зміни торкнулися спрощення роботи з асинхронними формами, оптимістичних оновлень та вбудованої підтримки асинхронних скриптів.",
                    "category": cat_map.get("development"),
                    "cover_image_url": "/images/card-m-5.png",
                    "is_hero": False,
                    "read_time_min": 5,
                    "views_count": 3150,
                    "likes_count": 245,
                    "comments_count": 34,
                    "published_at": now - timedelta(hours=1),
                    "tags": ["react", "typescript"],
                    "blocks": [
                        (BlockType.HEADING, {"text": "Кінець епохи forwardRef", "level": 2}),
                        (BlockType.TEXT, {"text": "У React 19 проп ref тепер передається звичайним пропом до функціональних компонентів, що значно спрощує типізацію."}),
                    ]
                },
                {
                    "title": "Unreal Engine 5.6: революційне глобальне освітлення Lumen та мобільний рендер M4",
                    "slug": "unreal-engine-5-6-revolutionary-lumen-global-illumination",
                    "lead": "Epic Games показала попередню версію UE 5.6. Рушій навчився прораховувати динамічні відбиття дзеркальних поверхонь у 4K 60FPS без артефактів шумів.",
                    "category": cat_map.get("gamedev-3d"),
                    "cover_image_url": "/images/card-m-6.png",
                    "is_hero": False,
                    "read_time_min": 3,
                    "views_count": 2840,
                    "likes_count": 189,
                    "comments_count": 19,
                    "published_at": now - timedelta(hours=2),
                    "tags": ["gpu"],
                    "blocks": [
                        (BlockType.HEADING, {"text": "Прорив у динамічній трасуванні променів", "level": 2}),
                        (BlockType.TEXT, {"text": "Lumen в UE 5.6 отримав суттєве оновлення продуктивності на чіпах Apple Silicon та архітектурах нового покоління."}),
                    ]
                },
                {
                    "title": "Мікросервіси vs Модульний Моноліт: чому індустрія переосмислює архітектурну моду 2018-го",
                    "slug": "why-we-abandoned-microservices-for-modular-monolith",
                    "lead": "Розбір тренду: команди інженерів від Amazon Prime Video до Shopify відкрито діляться досвідом зменшення хмарних витрат у рази після консолідації мікросервісів.",
                    "category": cat_map.get("development"),
                    "cover_image_url": "/images/card-m-8.png",
                    "is_hero": False,
                    "read_time_min": 7,
                    "views_count": 6810,
                    "likes_count": 540,
                    "comments_count": 88,
                    "published_at": now - timedelta(days=1),
                    "tags": ["rust", "linux"],
                    "blocks": [
                        (BlockType.HEADING, {"text": "Ціна розподіленої складності", "level": 2}),
                        (BlockType.TEXT, {"text": "Мережеві затримки, розподілені транзакції та складність оркестрації Kubernetes змушують компанії повертатися до монолітної архітектури."}),
                    ]
                },
                {
                    "title": "Apple M4 Max проти NVIDIA RTX 4090: тест локальних LLM із контекстом 128k токенів",
                    "slug": "apple-m4-max-vs-rtx-4090-local-llm-128k-benchmark",
                    "lead": "Завдяки 128GB об'єднаної пам'яті M4 Max здатен запускати 70B моделі квантування 4-bit повністю в оперативній пам'яті. Порівнюємо швидкість генерації токенів.",
                    "category": cat_map.get("hardware-chips"),
                    "cover_image_url": "/images/card-m-3.png",
                    "is_hero": False,
                    "read_time_min": 8,
                    "views_count": 9200,
                    "likes_count": 730,
                    "comments_count": 115,
                    "published_at": now - timedelta(hours=5),
                    "tags": ["gpu"],
                    "blocks": [
                        (BlockType.HEADING, {"text": "Об'єднана пам'ять як головна перевага", "level": 2}),
                        (BlockType.TEXT, {"text": "Питання обсягу VRAM залишається критичним для запуску великих моделей без перенесення шарів на CPU."}),
                    ]
                },
                {
                    "title": "Європейський AI Act набуває чинності: що це означає для розробників та open-source моделей",
                    "slug": "european-ai-act-compliance-guide-for-engineers",
                    "lead": "Повний практичний гайд: які моделі підпадають під статус systemic risk, як маркувати згенерований синтетичний контент та які штрафи загрожують порушникам.",
                    "category": cat_map.get("startups-market"),
                    "cover_image_url": "/images/card-m-7.png",
                    "is_hero": False,
                    "read_time_min": 5,
                    "views_count": 4120,
                    "likes_count": 298,
                    "comments_count": 42,
                    "published_at": now - timedelta(hours=6),
                    "tags": ["openai"],
                    "blocks": [
                        (BlockType.HEADING, {"text": "Класифікація систем штучного інтелекту", "level": 2}),
                        (BlockType.TEXT, {"text": "Європейський Союз впроваджує 4 рівні ризику для систем штучного інтелекту."}),
                    ]
                },
            ]

            for a_data in articles_data:
                cat = a_data["category"] or cat_map.get("ai")
                art = Article(
                    title=a_data["title"],
                    slug=a_data["slug"],
                    lead=a_data["lead"],
                    category_id=cat.id if cat else list(cat_map.values())[0].id,
                    author_id=author.id,
                    status=ArticleStatus.PUBLISHED,
                    published_at=a_data["published_at"],
                    cover_image_url=a_data["cover_image_url"],
                    is_hero=a_data["is_hero"],
                    read_time_min=a_data["read_time_min"],
                    views_count=a_data["views_count"],
                    likes_count=a_data["likes_count"],
                )
                db.add(art)
                db.flush()

                # Add blocks
                for idx, (b_type, payload) in enumerate(a_data["blocks"]):
                    block = ArticleBlock(
                        article_id=art.id,
                        block_type=b_type,
                        order_index=idx,
                        content_payload=payload,
                    )
                    db.add(block)

                # Add tags
                for t_slug in a_data["tags"]:
                    if t_slug in tag_map:
                        db.add(ArticleTag(article_id=art.id, tag_id=tag_map[t_slug].id))

            print(f"Created {len(articles_data)} articles in database!")

        # 3. Active Poll
        active_poll = db.scalar(select(Poll).where(Poll.is_active == True))
        if not active_poll:
            poll = Poll(
                question="Яку архітектуру ШІ-агентів ви вважаєте найбільш перспективною для production у 2026 році?",
                is_active=True,
                closes_at=datetime.now(timezone.utc) + timedelta(days=7),
            )
            db.add(poll)
            db.flush()

            options = [
                PollOption(poll_id=poll.id, option_text="ReAct з автономними кроками", votes_count=142),
                PollOption(poll_id=poll.id, option_text="Гібридні моделі (Extended Thinking)", votes_count=318),
                PollOption(poll_id=poll.id, option_text="Мультиагентні мережі (Swarm)", votes_count=215),
                PollOption(poll_id=poll.id, option_text="Локальні моделі з RAG", votes_count=95),
            ]
            db.add_all(options)
            print("Created active poll with options!")

        # 4. Flash News
        fn_count = db.scalar(select(FlashNews.id).limit(1))
        if not fn_count:
            now = datetime.now(timezone.utc)
            flash_data = [
                ("NVIDIA досягла ринкової капіталізації $3.8T на фоні рекордного попиту на чипи B200", "Акції зросли на 4.2% після квартального звіту.", "Залізо & Чіпи", "https://bloomberg.com/news/nvidia-record-2026", now - timedelta(minutes=15)),
                ("DeepSeek опублікувала ваги нової версії V3 з ліцензією MIT", "Модель перевершує закриті аналоги на тестах математики та коду.", "Штучний Інтелект", "https://github.com/deepseek-ai", now - timedelta(minutes=45)),
                ("Cloudflare відбила найбільшу в історії DDoS-атаку потужністю 3.8 Tbps", "Атака використовувала новий ботнет на базі скомпрометованих IoT-роутерів.", "Кібербезпека", "https://blog.cloudflare.com/ddos-3-8tbps", now - timedelta(hours=2)),
                ("У Rust 1.86 з'явилася нативна підтримка async closure без макросів", "Це значно спрощує роботу з асинхронними ітераторами та потоками даних.", "Розробка", "https://blog.rust-lang.org/2026/rust-1-86", now - timedelta(hours=4)),
            ]
            for title, summary, source_name, url, pub_at in flash_data:
                fn = FlashNews(
                    title=title,
                    summary=summary,
                    source_name=source_name,
                    url=url,
                    published_at=pub_at,
                )
                db.add(fn)
            print("Created flash news entries!")

        db.commit()
        print("Database seeded with full demo content successfully!")

if __name__ == "__main__":
    seed()
